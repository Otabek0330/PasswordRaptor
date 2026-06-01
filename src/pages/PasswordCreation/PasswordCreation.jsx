import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shuffle, Copy, Check, Plus, X, Settings, Clock, Hash } from 'lucide-react';
import {
  generateRandom, generatePassphrase, generateCustom,
  generateMemorable, generatePIN, generateBulk, BUNDLED_WORDS
} from '../../utils/passwordGenerator.js';
import { evaluatePassword } from '../../utils/passwordStrength.js';
import { useToast } from '../../context/ToastContext.jsx';
import './PasswordCreation.css';

const TABS = [
  { id: 'random',     label: 'Random'      },
  { id: 'passphrase', label: 'Passphrase'  },
  { id: 'custom',     label: 'Custom'      },
  { id: 'memorable',  label: 'Memorable'   },
  { id: 'bulk',       label: 'Bulk'        },
  { id: 'pin',        label: 'PIN'         },
];

const SEPARATORS = [
  { label: 'Hyphen -', value: '-' },
  { label: 'Dot .', value: '.' },
  { label: 'Underscore _', value: '_' },
  { label: 'Space', value: ' ' },
  { label: 'None', value: '' },
];

const MAX_HISTORY = 5;

export default function PasswordCreation() {
  const { showToast } = useToast();
  const [tab, setTab] = useState(0);
  const [password, setPassword] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [eval_, setEval] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Random
  const [rLen, setRLen] = useState(20);
  const [rUpper, setRUpper] = useState(true);
  const [rLower, setRLower] = useState(true);
  const [rDigits, setRDigits] = useState(true);
  const [rSymbols, setRSymbols] = useState(true);

  // Passphrase
  const [ppWords, setPpWords] = useState(5);
  const [ppSep, setPpSep] = useState('-');
  const [ppCap, setPpCap] = useState('title');
  const [ppNums, setPpNums] = useState(false);
  const [ppSyms, setPpSyms] = useState(false);

  // Custom
  const [customWords, setCustomWords] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [customLen, setCustomLen] = useState(20);
  const [customSep, setCustomSep] = useState('-');
  const [customError, setCustomError] = useState('');

  // Memorable
  const [sentence, setSentence] = useState('');
  const [memMixCase, setMemMixCase] = useState(true);
  const [memNumbers, setMemNumbers] = useState(true);
  const [memSymbols, setMemSymbols] = useState(true);
  const [memL33t, setMemL33t] = useState(false);

  // Bulk
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkLen, setBulkLen] = useState(16);
  const [bulkUpper, setBulkUpper] = useState(true);
  const [bulkLower, setBulkLower] = useState(true);
  const [bulkDigits, setBulkDigits] = useState(true);
  const [bulkSymbols, setBulkSymbols] = useState(true);
  const [bulkPasswords, setBulkPasswords] = useState([]);
  const [copiedBulkIdx, setCopiedBulkIdx] = useState(null);

  // PIN
  const [pinLen, setPinLen] = useState(6);
  const [pin, setPin] = useState('');

  useEffect(() => {
    document.title = 'Password Raptor | Create';
    // Generate initial password
    const pw = generateRandom({ length: 20, upper: true, lower: true, digits: true, symbols: true });
    setPassword(pw);
    setEval(evaluatePassword(pw));
    const initialPin = generatePIN(6);
    setPin(initialPin);
  }, []);

  // ── Build password from current tab settings ──
  const buildPassword = useCallback(() => {
    switch (TABS[tab].id) {
      case 'random':
        return generateRandom({ length: rLen, upper: rUpper, lower: rLower, digits: rDigits, symbols: rSymbols });
      case 'passphrase':
        return generatePassphrase({ wordList: BUNDLED_WORDS, wordCount: ppWords, separator: ppSep, capitalize: ppCap, injectNumbers: ppNums, injectSymbols: ppSyms });
      case 'custom':
        return customWords.length >= 2 ? generateCustom({ words: customWords, length: customLen, separator: customSep }) : '';
      case 'memorable':
        return sentence.trim() ? generateMemorable({ sentence, mixCase: memMixCase, addNumbers: memNumbers, addSymbols: memSymbols, l33t: memL33t }) : '';
      case 'pin':
        return generatePIN(pinLen);
      default:
        return '';
    }
  }, [tab, rLen, rUpper, rLower, rDigits, rSymbols, ppWords, ppSep, ppCap, ppNums, ppSyms, customWords, customLen, customSep, sentence, memMixCase, memNumbers, memSymbols, memL33t, pinLen]);

  // Auto-regenerate on settings change (non-bulk tabs)
  useEffect(() => {
    if (TABS[tab].id === 'bulk') return;
    const pw = buildPassword();
    if (pw) {
      setPassword(pw);
      setEval(evaluatePassword(pw));
    }
  }, [buildPassword, tab]);

  // ── Animate + Generate ──
  const handleGenerate = useCallback(() => {
    if (isAnimating) return;

    if (TABS[tab].id === 'bulk') {
      const passwords = generateBulk({ count: bulkCount, length: bulkLen, upper: bulkUpper, lower: bulkLower, digits: bulkDigits, symbols: bulkSymbols });
      setBulkPasswords(passwords);
      return;
    }

    setIsAnimating(true);
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let frame = 0;
    const maxFrames = 8;
    const interval = setInterval(() => {
      frame++;
      setPassword(Array.from({ length: 16 }, () => pool[Math.floor(Math.random() * pool.length)]).join(''));
      if (frame >= maxFrames) {
        clearInterval(interval);
        const final = buildPassword();
        if (final) {
          setPassword(final);
          setEval(evaluatePassword(final));
          setHistory(h => [{ pw: final, tab: TABS[tab].label, time: new Date().toLocaleTimeString() }, ...h].slice(0, MAX_HISTORY));
        }
        setIsAnimating(false);
      }
    }, 40);
  }, [isAnimating, tab, buildPassword, bulkCount, bulkLen, bulkUpper, bulkLower, bulkDigits, bulkSymbols]);

  // ── Copy ──
  const handleCopy = useCallback(() => {
    if (!password || isAnimating) return;
    navigator.clipboard.writeText(password).then(() => {
      showToast('Password copied to clipboard', 'success');
    });
  }, [password, isAnimating, showToast]);

  const handleCopyBulk = (pw, idx) => {
    navigator.clipboard.writeText(pw).then(() => {
      setCopiedBulkIdx(idx);
      showToast('Password copied', 'success');
      setTimeout(() => setCopiedBulkIdx(null), 2000);
    });
  };

  const handleCopyHistory = (pw) => {
    navigator.clipboard.writeText(pw).then(() => showToast('Password copied from history', 'success'));
  };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') { e.preventDefault(); handleGenerate(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !window.getSelection().toString()) { e.preventDefault(); handleCopy(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleGenerate, handleCopy]);

  // ── Swipe between tabs (mobile) ──
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      setTab(t => diff > 0 ? Math.min(t + 1, TABS.length - 1) : Math.max(t - 1, 0));
    }
    touchStartX.current = null;
  };

  // ── Custom words helpers ──
  const addCustomWord = () => {
    const w = customInput.trim();
    if (!w) return;
    if (w.length < 2) { setCustomError('Word must be at least 2 characters'); return; }
    if (w.length > 15) { setCustomError('Word must be 15 characters or fewer'); return; }
    if (customWords.includes(w)) { setCustomError('Word already added'); return; }
    if (customWords.length >= 8) { setCustomError('Maximum 8 words'); return; }
    setCustomWords(p => [...p, w]);
    setCustomInput('');
    setCustomError('');
  };

  const isBulkTab = TABS[tab].id === 'bulk';
  const isPinTab  = TABS[tab].id === 'pin';

  return (
    <div
      className="create"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="create__header">
        <div className="create__header-top">
          <div>
            <h1>Password Creation</h1>
            <p>Choose a mode and configure your password below.</p>
          </div>
          <div className="create__header-actions">
            {history.length > 0 && (
              <button
                className={`create__history-btn ${showHistory ? 'create__history-btn--active' : ''}`}
                onClick={() => setShowHistory(v => !v)}
                title="Session history"
              >
                <Clock size={15} />
                History ({history.length})
              </button>
            )}
            <div className="create__shortcut-hint">
              <kbd>Ctrl</kbd>+<kbd>G</kbd> generate &nbsp;
              <kbd>Ctrl</kbd>+<kbd>C</kbd> copy
            </div>
          </div>
        </div>

        {/* History panel */}
        {showHistory && history.length > 0 && (
          <div className="create__history">
            <div className="create__history-header">
              <span>Recent passwords (this session only)</span>
              <button onClick={() => setHistory([])} className="create__history-clear">Clear</button>
            </div>
            {history.map((item, i) => (
              <div key={i} className="create__history-item">
                <div className="create__history-pw">
                  <span className="create__history-text">{item.pw}</span>
                  <span className="create__history-meta">{item.tab} · {item.time}</span>
                </div>
                <button className="create__history-copy" onClick={() => handleCopyHistory(item.pw)} title="Copy">
                  <Copy size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Password Display (hidden for bulk) ── */}
      {!isBulkTab && (
        <div className="create__display-wrap">
          <div className="create__display">
            <div className="create__pw-box">
              <span className={`create__pw-text ${isAnimating ? 'create__pw-text--anim' : ''} ${isPinTab ? 'create__pw-text--pin' : ''}`}>
                {password || 'Your password will appear here'}
              </span>
            </div>
            <div className="create__display-actions">
              <button className="icon-btn icon-btn--primary" onClick={handleGenerate} disabled={isAnimating || (TABS[tab].id === 'custom' && customWords.length < 2) || (TABS[tab].id === 'memorable' && !sentence.trim())} title="Regenerate (Ctrl+G)">
                <Shuffle size={18} className={isAnimating ? 'spin' : ''} />
              </button>
              <button className="icon-btn" onClick={handleCopy} disabled={!password || isAnimating} title="Copy (Ctrl+C)">
                <Copy size={18} />
              </button>
            </div>
          </div>

          {eval_ && !isPinTab && (
            <div className="create__strength">
              <div className="create__strength-bar">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`create__strength-seg ${i <= eval_.strengthIndex ? 'create__strength-seg--filled' : ''}`}
                    style={{ '--seg-color': i <= eval_.strengthIndex ? eval_.color : undefined }} />
                ))}
              </div>
              <div className="create__strength-meta">
                <span style={{ color: eval_.color }}>{eval_.strength}</span>
                <span className="create__entropy">{eval_.entropy} bits entropy</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="create__tabs" role="tablist">
        {TABS.map((t, i) => (
          <button key={t.id} role="tab" aria-selected={tab === i}
            className={`create__tab ${tab === i ? 'create__tab--active' : ''}`}
            onClick={() => setTab(i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Panel ── */}
      <div className="create__panel">

        {/* RANDOM */}
        {TABS[tab].id === 'random' && (
          <div className="create__options">
            <div className="create__section-title"><Settings size={14} /> Options</div>
            <div className="create__toggles">
              <Toggle label="Uppercase (A–Z)" checked={rUpper}   onChange={() => setRUpper(v=>!v)} />
              <Toggle label="Lowercase (a–z)" checked={rLower}   onChange={() => setRLower(v=>!v)} />
              <Toggle label="Numbers (0–9)"   checked={rDigits}  onChange={() => setRDigits(v=>!v)} />
              <Toggle label="Symbols (!@#…)"  checked={rSymbols} onChange={() => setRSymbols(v=>!v)} />
            </div>
            <Slider label="Length" value={rLen} min={8} max={64} onChange={setRLen} />
          </div>
        )}

        {/* PASSPHRASE */}
        {TABS[tab].id === 'passphrase' && (
          <div className="create__options">
            <div className="create__section-title"><Settings size={14} /> Options</div>
            <Slider label="Number of words" value={ppWords} min={3} max={10} onChange={setPpWords} />
            <div className="create__field">
              <label className="create__label">Separator</label>
              <div className="create__sep-grid">
                {SEPARATORS.map(s => (
                  <button key={s.value} className={`create__sep-btn ${ppSep === s.value ? 'create__sep-btn--active' : ''}`} onClick={() => setPpSep(s.value)}>{s.label}</button>
                ))}
              </div>
            </div>
            <div className="create__field">
              <label className="create__label">Capitalisation</label>
              <div className="create__cap-grid">
                {[['none','none'],['title','Title Case'],['upper','UPPER'],['random','rAnDoM']].map(([v,l]) => (
                  <button key={v} className={`create__sep-btn ${ppCap === v ? 'create__sep-btn--active' : ''}`} onClick={() => setPpCap(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="create__toggles">
              <Toggle label="Inject numbers into words" checked={ppNums} onChange={() => setPpNums(v=>!v)} />
              <Toggle label="Inject symbols into words" checked={ppSyms} onChange={() => setPpSyms(v=>!v)} />
            </div>
          </div>
        )}

        {/* CUSTOM */}
        {TABS[tab].id === 'custom' && (
          <div className="create__options">
            <div className="create__section-title"><Settings size={14} /> Your Words</div>
            <p className="create__hint">Add 2–8 words meaningful to you. They'll be mutated and combined.</p>
            <div className="create__word-input-row">
              <input className="create__word-input" type="text" value={customInput}
                onChange={e => { setCustomInput(e.target.value); setCustomError(''); }}
                onKeyDown={e => e.key === 'Enter' && addCustomWord()}
                placeholder="Type a word and press Enter or Add"
                maxLength={15} disabled={customWords.length >= 8}
              />
              <button className="create__add-btn" onClick={addCustomWord} disabled={customWords.length >= 8 || !customInput.trim()}>
                <Plus size={16} /> Add
              </button>
            </div>
            {customError && <p className="create__error">{customError}</p>}
            <div className="create__chips">
              {customWords.map((w, i) => (
                <span key={i} className="create__chip">
                  {w}
                  <button className="create__chip-remove" onClick={() => setCustomWords(p => p.filter((_,idx) => idx !== i))}><X size={12} /></button>
                </span>
              ))}
              {customWords.length === 0 && <span className="create__chips-empty">No words yet — add at least 2</span>}
            </div>
            <Slider label="Maximum length" value={customLen} min={10} max={40} onChange={setCustomLen} />
            <div className="create__field">
              <label className="create__label">Separator</label>
              <div className="create__sep-grid">
                {SEPARATORS.map(s => (
                  <button key={s.value} className={`create__sep-btn ${customSep === s.value ? 'create__sep-btn--active' : ''}`} onClick={() => setCustomSep(s.value)}>{s.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEMORABLE */}
        {TABS[tab].id === 'memorable' && (
          <div className="create__options">
            <div className="create__section-title"><Settings size={14} /> Sentence to Password</div>
            <p className="create__hint">
              Type a sentence you'll remember. We take the first letter of each word and transform it into a strong password.
              <br /><span className="create__hint-example">e.g. "I love coffee every morning at 8" → ILc3eMa@8!</span>
            </p>
            <textarea
              className="create__sentence-input"
              value={sentence}
              onChange={e => setSentence(e.target.value)}
              placeholder="Type a memorable sentence…"
              rows={3}
              maxLength={200}
            />
            <div className="create__toggles">
              <Toggle label="Mix uppercase / lowercase" checked={memMixCase} onChange={() => setMemMixCase(v=>!v)} disabled={memL33t} />
              <Toggle label="Inject numbers"            checked={memNumbers}  onChange={() => setMemNumbers(v=>!v)} />
              <Toggle label="Inject symbols"            checked={memSymbols}  onChange={() => setMemSymbols(v=>!v)} />
              <Toggle label="l33t speak substitutions"  checked={memL33t}     onChange={() => setMemL33t(v=>!v)} />
            </div>
          </div>
        )}

        {/* BULK */}
        {TABS[tab].id === 'bulk' && (
          <div className="create__options">
            <div className="create__section-title"><Settings size={14} /> Bulk Generator</div>
            <p className="create__hint">Generate multiple passwords at once. All use the same settings.</p>
            <Slider label="Number of passwords" value={bulkCount} min={5} max={50} onChange={setBulkCount} />
            <Slider label="Length" value={bulkLen} min={8} max={64} onChange={setBulkLen} />
            <div className="create__toggles">
              <Toggle label="Uppercase (A–Z)" checked={bulkUpper}   onChange={() => setBulkUpper(v=>!v)} />
              <Toggle label="Lowercase (a–z)" checked={bulkLower}   onChange={() => setBulkLower(v=>!v)} />
              <Toggle label="Numbers (0–9)"   checked={bulkDigits}  onChange={() => setBulkDigits(v=>!v)} />
              <Toggle label="Symbols (!@#…)"  checked={bulkSymbols} onChange={() => setBulkSymbols(v=>!v)} />
            </div>
            <button className="create__generate-btn" onClick={handleGenerate}>
              <Shuffle size={16} /> Generate {bulkCount} Passwords
            </button>
            {bulkPasswords.length > 0 && (
              <div className="create__bulk-list">
                <div className="create__bulk-header">
                  <span>{bulkPasswords.length} passwords generated</span>
                  <button className="create__bulk-copy-all" onClick={() => {
                    navigator.clipboard.writeText(bulkPasswords.join('\n'));
                    showToast(`Copied all ${bulkPasswords.length} passwords`, 'success');
                  }}>
                    <Copy size={13} /> Copy All
                  </button>
                </div>
                {bulkPasswords.map((pw, i) => (
                  <div key={i} className="create__bulk-item">
                    <span className="create__bulk-num">{i + 1}</span>
                    <span className="create__bulk-pw">{pw}</span>
                    <button
                      className={`create__bulk-copy ${copiedBulkIdx === i ? 'create__bulk-copy--done' : ''}`}
                      onClick={() => handleCopyBulk(pw, i)}
                    >
                      {copiedBulkIdx === i ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PIN */}
        {TABS[tab].id === 'pin' && (
          <div className="create__options">
            <div className="create__section-title"><Hash size={14} /> PIN Generator</div>
            <p className="create__hint">Generate a cryptographically random numeric PIN. All digits chosen independently.</p>
            <div className="create__pin-display">
              {pin.split('').map((d, i) => (
                <span key={i} className="create__pin-digit">{d}</span>
              ))}
            </div>
            <div className="create__pin-actions">
              <button className="create__generate-btn create__generate-btn--pin" onClick={() => { const p = generatePIN(pinLen); setPin(p); setPassword(p); }}>
                <Shuffle size={16} /> New PIN
              </button>
              <button className="icon-btn" onClick={() => { navigator.clipboard.writeText(pin); showToast('PIN copied', 'success'); }} title="Copy PIN">
                <Copy size={18} />
              </button>
            </div>
            <div className="create__pin-lengths">
              {[4,6,8,10,12].map(l => (
                <button key={l} className={`create__pin-len-btn ${pinLen === l ? 'create__pin-len-btn--active' : ''}`}
                  onClick={() => { setPinLen(l); const p = generatePIN(l); setPin(p); setPassword(p); }}>
                  {l} digits
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate button (non-bulk/pin tabs) */}
        {!isBulkTab && !isPinTab && (
          <button
            className="create__generate-btn"
            onClick={handleGenerate}
            disabled={isAnimating
              || (TABS[tab].id === 'custom' && customWords.length < 2)
              || (TABS[tab].id === 'memorable' && !sentence.trim())
            }
          >
            <Shuffle size={16} />
            {isAnimating ? 'Generating…' : 'Generate New Password'}
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <label className={`toggle ${disabled ? 'toggle--disabled' : ''}`}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
      <span className="toggle__track"><span className="toggle__thumb" /></span>
      <span className="toggle__label">{label}</span>
    </label>
  );
}

function Slider({ label, value, min, max, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-field">
      <div className="slider-field__header">
        <label className="create__label">{label}</label>
        <span className="slider-field__value">{value}</span>
      </div>
      <input type="range" className="slider" min={min} max={max} value={value}
        onChange={e => onChange(+e.target.value)} style={{ '--pct': `${pct}%` }} />
    </div>
  );
}
