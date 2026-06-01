// ===========================
//  Password Raptor — Generators v2
//  Bundled wordlist — no external file dependency
// ===========================

export const BUNDLED_WORDS = [
  'acorn','adapt','agile','alarm','album','alert','alien','alley','almond','angel',
  'ankle','apple','arena','armor','arrow','asset','azure','badge','baker','beach',
  'beard','bench','berry','blade','blast','blend','bloom','board','booth','brave',
  'brick','brook','brush','burst','camel','candy','cargo','cedar','chain','chalk',
  'chase','chess','chest','child','chill','chord','claim','clear','cliff','climb',
  'clock','cloud','comet','coral','court','cover','craft','crane','creek','crisp',
  'cross','crowd','crown','crush','curve','cycle','dance','delta','dense','depth',
  'dodge','draft','drain','drama','drift','drill','drive','drone','eagle','earth',
  'elite','ember','enjoy','equal','event','exact','extra','fable','faith','fancy',
  'feast','fence','ferry','field','final','flame','flask','float','flood','floor',
  'flora','fluid','focus','force','forge','found','frame','fresh','frost','fruit',
  'ghost','given','glass','globe','gloom','glove','grace','grade','grain','grand',
  'grasp','grave','greed','greet','grief','grind','guard','guide','guild','habit',
  'happy','harsh','haven','heart','heavy','herbs','hinge','honor','horse','hotel',
  'house','human','humor','image','indie','input','ivory','jewel','joint','judge',
  'juice','jumbo','karma','kayak','knife','knock','label','laser','latch','laugh',
  'layer','learn','ledge','lemon','level','light','linen','local','lodge','logic',
  'lotus','lower','loyal','lunar','magic','major','maker','maple','marsh','match',
  'merit','metal','might','mirth','money','month','moral','mount','mouse','mural',
  'music','nerve','nexus','night','noble','noise','north','novel','nurse','occur',
  'offer','order','oxide','ozone','paint','panel','paper','party','paste','patch',
  'peach','pearl','pedal','penny','perch','pilot','pixel','pivot','place','plain',
  'plane','plank','plant','plate','plaza','pouch','power','press','prime','print',
  'prism','prize','probe','proof','prose','proud','pulse','query','quest','quick',
  'quiet','quote','radar','radio','raise','range','rapid','razor','reach','realm',
  'rebel','reign','relay','resin','ridge','rifle','right','rigid','risky','rival',
  'river','robot','rocky','rouge','round','rover','rugby','ruler','rural','saint',
  'sandy','sauce','scale','scout','sense','serve','shade','shaft','shake','sharp',
  'shelf','shell','shift','shine','sigma','skill','slate','sleep','slide','slope',
  'smart','smile','smoke','solar','solid','solve','sonar','south','space','spark',
  'speak','speed','spend','spice','spike','spire','split','sport','spray','stall',
  'stamp','stand','stark','start','state','steel','steep','steer','stern','stock',
  'stone','store','storm','story','strap','straw','strip','stuck','study','style',
  'sugar','suite','sunny','super','surge','swamp','swift','swirl','sword','syrup',
  'talon','tango','taste','teach','tense','terms','terra','tidal','timer','title',
  'toast','token','torch','total','touch','toxic','trace','track','trade','trail',
  'train','trait','trash','trend','tribe','trick','trove','trust','truth','tulip',
  'tuner','tunic','tutor','ultra','under','unify','until','upper','upset','urban',
  'valid','value','vapor','vault','verse','viper','virus','visor','vista','vital',
  'vivid','vocal','voice','voter','wafer','waltz','waste','watch','water','weave',
  'wedge','weigh','weird','whisk','white','whole','windy','witty','world','worth',
  'wrath','write','yacht','yearn','yield','young','zebra','zesty','baron','blaze',
  'brave','brine','brisk','canal','chalk','cinch','civic','cloak','coast','cobalt',
  'crest','crimp','cubic','denim','depth','depot','digit','disco','diver','doubt',
];

const CHARS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  digits:  '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

function secureRandInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Random ----------
export function generateRandom({ length = 16, upper = true, lower = true, digits = true, symbols = true }) {
  let pool = '';
  const required = [];
  if (upper)   { pool += CHARS.upper;   required.push(CHARS.upper[secureRandInt(CHARS.upper.length)]); }
  if (lower)   { pool += CHARS.lower;   required.push(CHARS.lower[secureRandInt(CHARS.lower.length)]); }
  if (digits)  { pool += CHARS.digits;  required.push(CHARS.digits[secureRandInt(CHARS.digits.length)]); }
  if (symbols) { pool += CHARS.symbols; required.push(CHARS.symbols[secureRandInt(CHARS.symbols.length)]); }
  if (!pool) return 'Select at least one option';
  const password = [...required];
  for (let i = required.length; i < length; i++) password.push(pool[secureRandInt(pool.length)]);
  return shuffle(password).join('');
}

// ---------- Passphrase ----------
export function generatePassphrase({ wordList, wordCount = 4, separator = '-', capitalize = 'title', injectNumbers = false, injectSymbols = false }) {
  const list = (wordList && wordList.length > 50) ? wordList : BUNDLED_WORDS;
  const usedIndices = new Set();
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    let idx, attempts = 0;
    do { idx = secureRandInt(list.length); attempts++; }
    while (usedIndices.has(idx) && list.length > wordCount && attempts < 200);
    usedIndices.add(idx);
    let word = list[idx];
    switch (capitalize) {
      case 'first': case 'title': word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); break;
      case 'upper':  word = word.toUpperCase(); break;
      case 'random': word = word.split('').map(c => secureRandInt(2) ? c.toUpperCase() : c.toLowerCase()).join(''); break;
      default: word = word.toLowerCase();
    }
    if (injectNumbers) { const d = secureRandInt(10).toString(); const p = secureRandInt(word.length + 1); word = word.slice(0,p)+d+word.slice(p); }
    if (injectSymbols) { const s = '!@#$%^&*'[secureRandInt(8)]; word = secureRandInt(2) ? s+word : word+s; }
    words.push(word);
  }
  return words.join(separator);
}

// ---------- Custom ----------
export function generateCustom({ words, length = 16, separator = '-' }) {
  if (!words || words.length < 2) return 'Add at least 2 words';
  const shuffled = shuffle(words);
  const mutated = shuffled.map(word => {
    let w = word;
    const r = secureRandInt(4);
    if (r === 0) w = w.toUpperCase();
    else if (r === 1) w = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    else if (r === 2) { const pos = Math.floor(w.length/2); w = w.slice(0,pos)+secureRandInt(10)+w.slice(pos); }
    return w;
  });
  let password = mutated.join(separator);
  if (password.length > length) return password.slice(0, length);
  const pool = CHARS.lower + CHARS.digits;
  while (password.length < length) password += pool[secureRandInt(pool.length)];
  return password;
}

// ---------- Memorable ----------
export function generateMemorable({ sentence, mixCase = true, addNumbers = true, addSymbols = true, l33t = false }) {
  if (!sentence.trim()) return '';
  const words = sentence.trim().split(/\s+/);
  let initials = words.map(w => w.replace(/[^a-zA-Z0-9]/g, '').charAt(0) || '').join('');
  if (!initials) return '';
  if (l33t) {
    initials = initials.replace(/a/gi,'@').replace(/e/gi,'3').replace(/i/gi,'1').replace(/o/gi,'0').replace(/s/gi,'$');
  } else if (mixCase) {
    initials = initials.split('').map((c,i) => i%2===0 ? c.toUpperCase() : c.toLowerCase()).join('');
  }
  if (addNumbers) {
    const num = (10 + secureRandInt(90)).toString();
    const pos = Math.floor(initials.length / 2);
    initials = initials.slice(0,pos) + num + initials.slice(pos);
  }
  if (addSymbols) {
    initials += '!@#$%^&*'[secureRandInt(8)];
  }
  return initials;
}

// ---------- PIN ----------
export function generatePIN(length = 6) {
  return Array.from({ length }, () => secureRandInt(10).toString()).join('');
}

// ---------- Bulk ----------
export function generateBulk({ count = 10, ...opts }) {
  return Array.from({ length: count }, () => generateRandom(opts));
}

// ---------- Load external dictionary (optional) ----------
export async function loadWordList() {
  try {
    const res = await fetch('/dictionary.txt');
    if (!res.ok) throw new Error('not found');
    const text = await res.text();
    const words = text.split(/\r?\n/).map(w => w.trim()).filter(w => /^[a-zA-Z]{3,10}$/.test(w));
    return words.length > 100 ? words : BUNDLED_WORDS;
  } catch {
    return BUNDLED_WORDS;
  }
}
