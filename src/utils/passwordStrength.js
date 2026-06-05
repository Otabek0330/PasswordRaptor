// =========================================================
//  Password Raptor — Strength Evaluator v3
//  Fixes: expanded common list, sequence threshold, deduped regex
// =========================================================

// Fix #7 — expanded from 44 → ~300 entries
const COMMON_PASSWORDS = new Set([
  // Top sequences
  '123456','1234567','12345678','123456789','1234567890','12345','1234','123',
  '000000','0000','111111','11111111','222222','333333','444444','555555',
  '666666','777777','888888','999999','112233','121212','123123','123321',
  '123456a','1234abcd','12341234','123qwe','1q2w3e','1q2w3e4r','q1w2e3r4',
  '101010','010101','102030','112358','131313','141414','151515','161616',
  // Keyboard patterns
  'qwerty','qwerty1','qwerty12','qwerty123','qwertyuiop','qwertyuiop1',
  'asdfgh','asdfghjkl','asdf1234','asdfasdf','asdfzxcv',
  'zxcvbn','zxcvbnm','zxcvbn1','zxcv1234',
  'qazwsx','qazwsxedc','!qaz2wsx','zaq1zaq1','qazxswedc',
  'qweqwe','asdasd','zxczxc','qweasd','qweasdzxc',
  // Password variations
  'password','password1','password2','password12','password123','password1234',
  'passw0rd','p@ssword','p@ssw0rd','p@$$word','pa$$word','pa$$w0rd',
  'passwd','pasword','passwrd','passwor','passpass','pass1234',
  'Password','Password1','Password123',
  // Common words
  'welcome','welcome1','welcome2','welcome123',
  'hello','hello1','hello12','hello123','hello1234',
  'admin','admin1','admin12','admin123','admin1234','admin@123',
  'administrator','administrator1',
  'root','root1','root123','toor',
  'test','test1','test12','test123','test1234','testing','testing1',
  'guest','guest1','guest123',
  'user','user1','user123','user1234',
  'login','login1','login123',
  'access','access1','access123',
  'master','master1','master123',
  'letmein','letmein1','letmein123',
  'changeme','changeme1','change123',
  'iloveyou','iloveyou1','iloveyou!','ilove123',
  'monkey','monkey1','monkey12','monkey123',
  'dragon','dragon1','dragon123',
  'shadow','shadow1','shadow12','shadow123',
  'sunshine','sunshine1','sunshine123',
  'princess','princess1','princess123',
  'superman','superman1','superman123',
  'batman','batman1','batman123',
  'trustno1','trustno1!',
  'starwars','starwars1',
  'abc123','abc1234','abcd1234','abcdefgh','abcdef',
  'abc','abcd','abcde','abcdef','abcdefg',
  'pass','pass1','pass12','pass123','pass1234',
  'temp','temp1','temp123','temp1234',
  'newpass','newpass1','newpassword',
  'ninja','ninja1','ninja123',
  'mustang','mustang1',
  // Names
  'michael','michael1','michael123',
  'charlie','charlie1','charlie123',
  'jessica','jessica1','jessica123',
  'ashley','ashley1','ashley123',
  'daniel','daniel1','daniel123',
  'thomas','thomas1','thomas123',
  'andrew','andrew1','andrew123',
  'joshua','joshua1','joshua123',
  'jennifer','jennifer1','jennifer123',
  'amanda','amanda1','amanda123',
  'melissa','melissa1','melissa123',
  'sarah','sarah1','sarah123',
  'robert','robert1','robert123',
  'james','james1','james123',
  'john','john1','john123',
  'david','david1','david123',
  'william','william1',
  'mary','mary1','mary123',
  'maggie','maggie1','maggie123',
  'hunter','hunter1','hunter2',
  'hannah','hannah1','hannah123',
  'jordan','jordan1','jordan23',
  'taylor','taylor1','taylor123',
  'morgan','morgan1','morgan123',
  'alex','alex1','alex123',
  'chris','chris1','chris123',
  'matt','matt1','matt123',
  'mike','mike1','mike123',
  // Sports/games
  'baseball','baseball1',
  'football','football1',
  'soccer','soccer1','soccer12',
  'hockey','hockey1','hockey12',
  'basketball','basketball1',
  'lakers','lakers1','laker1',
  'yankees','yankees1','yankee1',
  'cowboys','cowboys1',
  'patriots','patriots1',
  'chelsea','chelsea1',
  'arsenal','arsenal1',
  'liverpool','liverpool1',
  'nintendo','nintendo1',
  'pokemon','pokemon1','pokemon12',
  'mario','mario1','mario123',
  'zelda','zelda1','zelda123',
  'xbox','xbox1','xbox360','xbox123',
  'playstation','playstation1',
  'minecraft','minecraft1',
  'fortnite','fortnite1',
  'roblox','roblox1',
  // Tech terms
  'android','android1','android123',
  'iphone','iphone1','iphone123',
  'google','google1','google123',
  'facebook','facebook1','facebook123',
  'twitter','twitter1','twitter123',
  'instagram','instagram1',
  'linkedin','linkedin1',
  'apple123','apple1234',
  'windows','windows1','windows10','windows123',
  'linux','linux1','linux123',
  'ubuntu','ubuntu1',
  'computer','computer1','computer123',
  'internet','internet1',
  // Common phrases / words
  'love','love1','love123','lovely','lovely1',
  'sexy','sexy1','sexy123',
  'secret','secret1','secret123',
  'pepper','pepper1','pepper123',
  'cheese','cheese1','cheese123',
  'coffee','coffee1','coffee123',
  'butter','butter1','butter123',
  'purple','purple1','purple123',
  'flower','flower1','flower123',
  'summer','summer1','summer123',
  'winter','winter1','winter123',
  'spring','spring1','spring123',
  'holiday','holiday1',
  'cookie','cookie1','cookie123',
  'chocolate','chocolate1',
  'rainbow','rainbow1','rainbow123',
  'angel','angel1','angel123',
  'heaven','heaven1','heaven123',
  'lucky','lucky1','lucky123',
  'tiger','tiger1','tiger123',
  'ranger','ranger1','ranger123',
  'silver','silver1','silver123',
  'golden','golden1','golden123',
  'black','black1','black123',
  'white','white1','white123',
  'green','green1','green123',
  'blue','blue1','blue123',
  'red','red1','red123',
  'music','music1','music123',
  'happy','happy1','happy123',
  // Dates that people use as passwords
  '19900101','19910101','19920101','19930101','19940101',
  '19950101','19960101','19970101','19980101','19990101',
  '20000101','20010101','20020101','20030101',
  // l33t speak variants (covered by lowercase check but adding anyway)
  'p4ssword','p4$$w0rd','pa55word','pa55w0rd',
  // Other top entries
  'monkey123','dragon12','pass@123','admin@1234','root@123',
  'qwerty@123','abc@123','password@1','password@123',
]);

const KEYBOARD_SEQUENCES = [
  'qwertyuiop','asdfghjkl','zxcvbnm','1234567890','0987654321',
  'qwerty','azerty','qazwsx','wsxedc','edcrfv','rfvtgb','tgbyhn','yhnujm',
];

// ── Pattern detectors ──

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
      if (lower.includes(seq.slice(i, i + 4)) || lower.includes(rev.slice(i, i + 4))) return true;
    }
  }
  return false;
}

// Fix #10 — require ≥4 sequential chars to avoid false positives on embedded short runs
function detectCharSequences(password) {
  for (let i = 0; i < password.length - 3; i++) {
    const a = password.charCodeAt(i);
    const b = password.charCodeAt(i + 1);
    const c = password.charCodeAt(i + 2);
    const d = password.charCodeAt(i + 3);
    const d1 = b - a, d2 = c - b, d3 = d - c;
    if (d1 === d2 && d2 === d3 && Math.abs(d1) === 1) return true;
  }
  return false;
}

function detectRepeatedChars(password) {
  return /(.)\1{2,}/.test(password);
}

function detectDegenerateRepeat(password) {
  const unique = new Set(password).size;
  return unique === 1 || unique / password.length < 0.2;
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
  return [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(password)).length === 1;
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds > 1e18) return 'Centuries';
  if (seconds < 1)       return 'Instantly';
  if (seconds < 60)      return `${Math.round(seconds)} sec`;
  if (seconds < 3600)    return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400)   return `${Math.round(seconds / 3600)} hrs`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  const years = seconds / 31536000;
  if (years < 1e3)  return `${Math.round(years)} years`;
  if (years < 1e6)  return `${(years / 1e3).toFixed(0)}K years`;
  if (years < 1e9)  return `${(years / 1e6).toFixed(0)}M years`;
  if (years < 1e12) return `${(years / 1e9).toFixed(0)}B years`;
  return 'Centuries';
}

export function evaluatePassword(password) {
  if (!password || password.length === 0) return null;

  const len = password.length;
  const charsetSize = getCharsetSize(password);
  const rawEntropy = len * Math.log2(Math.max(charsetSize, 1));
  const actualEntropy = shannonEntropy(password);
  let baseEntropy = rawEntropy * 0.6 + actualEntropy * 0.4;

  // Fix #19 — run all detections ONCE, reuse results everywhere
  const isCommon          = COMMON_PASSWORDS.has(password.toLowerCase());
  const isDegenerate      = detectDegenerateRepeat(password);
  const hasKeyboardWalk   = detectKeyboardWalk(password);
  const hasCharSequences  = detectCharSequences(password);
  const hasRepeatedChars  = detectRepeatedChars(password);
  const hasRepeatedPat    = detectRepeatedPatterns(password);
  const hasDatePattern    = detectDatePattern(password);
  const oneCharType       = detectOnlyOneCharType(password);
  const hasLower          = /[a-z]/.test(password);
  const hasUpper          = /[A-Z]/.test(password);
  const hasDigits         = /[0-9]/.test(password);
  const hasSymbols        = /[^a-zA-Z0-9]/.test(password);

  const penalties = [];
  const addPenalty = (label, bits) => {
    penalties.push({ label, bits });
    baseEntropy = Math.max(0, baseEntropy - bits);
  };

  if (isCommon)         addPenalty('Common password',             50);
  if (isDegenerate)     addPenalty('Nearly all identical chars',  40);
  if (hasKeyboardWalk)  addPenalty('Keyboard pattern',            15);
  if (hasCharSequences) addPenalty('Sequential characters (4+)',  10);
  if (hasRepeatedChars) addPenalty('Repeated characters (3+)',    10);
  if (hasRepeatedPat)   addPenalty('Repeated pattern',            12);
  if (hasDatePattern)   addPenalty('Date/year pattern',            8);
  if (oneCharType)      addPenalty('Only one character type',      8);
  if (len < 8)          addPenalty('Very short password',          20);
  else if (len < 12)    addPenalty('Short password',                8);

  const finalEntropy = Math.max(0, baseEntropy);
  const combinations = Math.pow(2, finalEntropy);

  const crackTimes = {
    online:       formatTime(combinations / 10),
    offline_slow: formatTime(combinations / 1e4),
    offline_fast: formatTime(combinations / 1e10),
  };

  const score = Math.min(100, Math.round((finalEntropy / 100) * 100));

  let strength, color, strengthIndex;
  if (finalEntropy < 28 || isCommon || isDegenerate) {
    strength = 'Very Weak'; color = '#FF4545'; strengthIndex = 0;
  } else if (finalEntropy < 40) {
    strength = 'Weak';       color = '#FF7020'; strengthIndex = 1;
  } else if (finalEntropy < 60) {
    strength = 'Fair';       color = '#FFD020'; strengthIndex = 2;
  } else if (finalEntropy < 80) {
    strength = 'Strong';     color = '#00C96E'; strengthIndex = 3;
  } else {
    strength = 'Very Strong'; color = '#00FF8A'; strengthIndex = 4;
  }

  // Reuse detection results — no second regex pass
  const inclusions = {
    length12:    { pass: len >= 12,         label: '12+ characters' },
    length16:    { pass: len >= 16,         label: '16+ characters (recommended)' },
    lowercase:   { pass: hasLower,          label: 'Lowercase letters' },
    uppercase:   { pass: hasUpper,          label: 'Uppercase letters' },
    numbers:     { pass: hasDigits,         label: 'Numbers' },
    symbols:     { pass: hasSymbols,        label: 'Special symbols' },
    noCommon:    { pass: !isCommon,         label: 'Not a common password' },
    noKeyboard:  { pass: !hasKeyboardWalk,  label: 'No keyboard patterns' },
    noSequences: { pass: !hasCharSequences, label: 'No long sequential chars' },
    noRepeats:   { pass: !hasRepeatedChars && !isDegenerate, label: 'No excessive repetition' },
  };

  const suggestions = [];
  if (len < 16)          suggestions.push('Use at least 16 characters for best security');
  else if (len < 12)     suggestions.push('Use at least 12 characters');
  if (!hasUpper)         suggestions.push('Add uppercase letters (A–Z)');
  if (!hasLower)         suggestions.push('Add lowercase letters (a–z)');
  if (!hasDigits)        suggestions.push('Add numbers (0–9)');
  if (!hasSymbols)       suggestions.push('Add symbols (!@#$%^&*)');
  if (isCommon)          suggestions.push('Avoid common passwords — this is in breach databases');
  if (isDegenerate)      suggestions.push('Avoid passwords made of mostly the same character');
  if (hasKeyboardWalk)   suggestions.push('Avoid keyboard walks (qwerty, asdf)');
  if (hasCharSequences)  suggestions.push('Avoid long sequential characters (abcd, 1234)');
  if (hasRepeatedChars)  suggestions.push('Avoid repeated characters (aaa, 111)');

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
