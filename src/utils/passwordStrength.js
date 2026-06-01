// =========================================================
//  Password Raptor — Custom Entropy-Based Strength Evaluator v2
// =========================================================

const COMMON_PASSWORDS = new Set([
  'password','password1','password123','passw0rd','p@ssword','p@ssw0rd',
  '123456','12345678','123456789','1234567890','1234','12345','000000',
  'qwerty','qwerty123','qwerty1','qwertyuiop','asdfgh','asdfghjkl','zxcvbn',
  'admin','admin123','administrator','root','test','guest','user','login',
  'welcome','welcome1','hello','hello123','letmein','iloveyou','sunshine',
  'monkey','dragon','master','shadow','superman','batman','baseball','football',
  'abc123','abc','trustno1','starwars','michael','charlie','donald','access',
  'ninja','mustang','password2','pass','changeme','newpass','temp','temp123',
  '111111','222222','333333','666666','777777','888888','999999','101010',
  '1q2w3e','1q2w3e4r','q1w2e3r4','zaq1zaq1','qazwsx','!qaz2wsx',
]);

const KEYBOARD_SEQUENCES = [
  'qwertyuiop','asdfghjkl','zxcvbnm','1234567890','0987654321',
  'qwerty','azerty','qazwsx','wsxedc','edcrfv','rfvtgb','tgbyhn','yhnujm',
];

function getCharsetSize(password) {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password)) size += 33;
  return size;
}

function shannonEntropy(password) {
  const freq = {};
  for (const ch of password) freq[ch] = (freq[ch] || 0) + 1;
  const len = password.length;
  return Object.values(freq).reduce((sum, count) => {
    const p = count / len;
    return sum - p * Math.log2(p);
  }, 0) * len;
}

function detectKeyboardWalk(password) {
  const lower = password.toLowerCase();
  for (const seq of KEYBOARD_SEQUENCES) {
    const rev = seq.split('').reverse().join('');
    for (let i = 0; i <= seq.length - 4; i++) {
      if (lower.includes(seq.slice(i, i+4)) || lower.includes(rev.slice(i, i+4))) return true;
    }
  }
  return false;
}

function detectCharSequences(password) {
  for (let i = 0; i < password.length - 2; i++) {
    const a = password.charCodeAt(i);
    const b = password.charCodeAt(i+1);
    const c = password.charCodeAt(i+2);
    if ((b-a === 1 && c-b === 1) || (a-b === 1 && b-c === 1)) return true;
  }
  return false;
}

function detectRepeatedChars(password) {
  return /(.)\1{2,}/.test(password);
}

// NEW: detect degenerate case — all same char or near-all same char
function detectDegenerateRepeat(password) {
  const unique = new Set(password).size;
  const ratio = unique / password.length;
  return unique === 1 || ratio < 0.2; // fewer than 20% unique chars
}

function detectRepeatedPatterns(password) {
  for (let len = 2; len <= Math.floor(password.length / 2); len++) {
    const seg = password.slice(0, len);
    const repeated = seg.repeat(Math.floor(password.length / len));
    if (password.startsWith(repeated.slice(0, password.length))) return true;
  }
  return false;
}

function detectDatePattern(password) {
  return /\b(19|20)\d{2}\b/.test(password) ||
    /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/.test(password);
}

function detectOnlyOneCharType(password) {
  const types = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(password));
  return types.length === 1;
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds > 1e18) return 'Centuries';
  if (seconds < 1)       return 'Instantly';
  if (seconds < 60)      return `${Math.round(seconds)} sec`;
  if (seconds < 3600)    return `${Math.round(seconds/60)} min`;
  if (seconds < 86400)   return `${Math.round(seconds/3600)} hrs`;
  if (seconds < 2592000) return `${Math.round(seconds/86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds/2592000)} months`;
  const years = seconds / 31536000;
  if (years < 1e3)  return `${Math.round(years)} years`;
  if (years < 1e6)  return `${(years/1e3).toFixed(0)}K years`;
  if (years < 1e9)  return `${(years/1e6).toFixed(0)}M years`;
  if (years < 1e12) return `${(years/1e9).toFixed(0)}B years`;
  return 'Centuries';
}

export function evaluatePassword(password) {
  if (!password || password.length === 0) return null;

  const len = password.length;
  const charsetSize = getCharsetSize(password);
  const rawEntropy = len * Math.log2(Math.max(charsetSize, 1));
  const actualEntropy = shannonEntropy(password);
  let baseEntropy = rawEntropy * 0.6 + actualEntropy * 0.4;

  const penalties = [];
  const addPenalty = (label, bits) => {
    penalties.push({ label, bits });
    baseEntropy = Math.max(0, baseEntropy - bits);
  };

  const isCommon = COMMON_PASSWORDS.has(password.toLowerCase());
  if (isCommon)                         addPenalty('Common password',           50);
  if (detectDegenerateRepeat(password)) addPenalty('Nearly all identical chars', 40);
  if (detectKeyboardWalk(password))     addPenalty('Keyboard pattern',           15);
  if (detectCharSequences(password))    addPenalty('Sequential characters',      10);
  if (detectRepeatedChars(password))    addPenalty('Repeated characters (3+)',   10);
  if (detectRepeatedPatterns(password)) addPenalty('Repeated pattern',           12);
  if (detectDatePattern(password))      addPenalty('Date/year pattern',           8);
  if (detectOnlyOneCharType(password))  addPenalty('Only one character type',     8);
  if (len < 8)                          addPenalty('Very short password',         20);
  else if (len < 12)                    addPenalty('Short password',               8);

  const finalEntropy = Math.max(0, baseEntropy);
  const combinations = Math.pow(2, finalEntropy);

  const crackTimes = {
    online:       formatTime(combinations / 10),
    offline_slow: formatTime(combinations / 1e4),
    offline_fast: formatTime(combinations / 1e10),
  };

  const score = Math.min(100, Math.round((finalEntropy / 100) * 100));

  let strength, color, strengthIndex;
  if (finalEntropy < 28 || isCommon || detectDegenerateRepeat(password)) {
    strength = 'Very Weak'; color = '#FF4545'; strengthIndex = 0;
  } else if (finalEntropy < 40) {
    strength = 'Weak';      color = '#FF7020'; strengthIndex = 1;
  } else if (finalEntropy < 60) {
    strength = 'Fair';      color = '#FFD020'; strengthIndex = 2;
  } else if (finalEntropy < 80) {
    strength = 'Strong';    color = '#00C96E'; strengthIndex = 3;
  } else {
    strength = 'Very Strong'; color = '#00FF8A'; strengthIndex = 4;
  }

  const inclusions = {
    length12:    { pass: len >= 12,                           label: '12+ characters' },
    length16:    { pass: len >= 16,                           label: '16+ characters (recommended)' },
    lowercase:   { pass: /[a-z]/.test(password),             label: 'Lowercase letters' },
    uppercase:   { pass: /[A-Z]/.test(password),             label: 'Uppercase letters' },
    numbers:     { pass: /[0-9]/.test(password),             label: 'Numbers' },
    symbols:     { pass: /[^a-zA-Z0-9]/.test(password),     label: 'Special symbols' },
    noCommon:    { pass: !isCommon,                           label: 'Not a common password' },
    noKeyboard:  { pass: !detectKeyboardWalk(password),      label: 'No keyboard patterns' },
    noSequences: { pass: !detectCharSequences(password),     label: 'No sequential chars' },
    noRepeats:   { pass: !detectRepeatedChars(password) && !detectDegenerateRepeat(password), label: 'No excessive repetition' },
  };

  const suggestions = [];
  if (len < 16)                              suggestions.push('Use at least 16 characters for best security');
  else if (len < 12)                         suggestions.push('Use at least 12 characters');
  if (!/[A-Z]/.test(password))              suggestions.push('Add uppercase letters (A–Z)');
  if (!/[a-z]/.test(password))              suggestions.push('Add lowercase letters (a–z)');
  if (!/[0-9]/.test(password))              suggestions.push('Add numbers (0–9)');
  if (!/[^a-zA-Z0-9]/.test(password))      suggestions.push('Add symbols (!@#$%^&*)');
  if (isCommon)                             suggestions.push('Avoid common passwords — this is in breach databases');
  if (detectDegenerateRepeat(password))     suggestions.push('Avoid passwords made of mostly the same character');
  if (detectKeyboardWalk(password))         suggestions.push('Avoid keyboard walks (qwerty, asdf)');
  if (detectCharSequences(password))        suggestions.push('Avoid sequential characters (abc, 123)');
  if (detectRepeatedChars(password))        suggestions.push('Avoid repeated characters (aaa, 111)');

  return {
    entropy: Math.round(finalEntropy * 10) / 10,
    score,
    strength,
    strengthIndex,
    color,
    crackTimes,
    penalties,
    suggestions,
    inclusions,
    length: len,
    charsetSize,
    rawEntropy: Math.round(rawEntropy * 10) / 10,
  };
}
