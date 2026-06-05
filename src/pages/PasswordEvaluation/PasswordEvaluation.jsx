import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert, ShieldCheck, ShieldX, Zap, Clock, Info, GitCompare, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { evaluatePassword } from '../../utils/passwordStrength.js';
import { useToast } from '../../context/ToastContext.jsx';
import './PasswordEvaluation.css';

const STRENGTH_ICONS = [ShieldX, ShieldAlert, ShieldAlert, ShieldCheck, ShieldCheck];
const CRACK_SCENARIOS = {
  online:       { label: 'Online Attack',         sub: 'Rate-limited login (10/sec)',     icon: '🌐' },
  offline_slow: { label: 'Offline (Secure Hash)',  sub: 'bcrypt / Argon2 (10k/sec)',      icon: '🛡️' },
  offline_fast: { label: 'Offline (Weak Hash)',    sub: 'MD5 / SHA-1 via GPU (10B/sec)',  icon: '⚡' },
};

function getCrackColor(t) {
  if (['Instantly','sec'].some(s => t.includes(s))) return 'var(--danger)';
  if (t.includes('min') || t.includes('hrs'))       return 'var(--warning)';
  if (t.includes('days') || t.includes('months'))   return 'var(--caution)';
  return 'var(--safe)';
}

const VIZ_PRESETS = [8, 12, 16, 20, 24, 32];

export default function PasswordEvaluation() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [password, setPassword]         = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [copied, setCopied]             = useState(false);
  const [result, setResult]             = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Entropy visualizer
  const [vizUpper,   setVizUpper]   = useState(true);
  const [vizLower,   setVizLower]   = useState(true);
  const [vizDigits,  setVizDigits]  = useState(true);
  const [vizSymbols, setVizSymbols] = useState(false);

  useEffect(() => {
    document.title = 'Password Raptor | Evaluate';
  }, []);

  // Keyboard shortcut: Ctrl+E focuses input
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleChange = useCallback((e) => {
    const val = e.target.value.slice(0, 128);
    setPassword(val);
    setResult(val ? evaluatePassword(val) : null);
    setCopied(false);
  }, []);

  // Fix #2 — proper copy button with icon + state
  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      showToast('Password copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Fix #11 — entropy visualizer vars
  const vizCharsetSize = (vizUpper ? 26 : 0) + (vizLower ? 26 : 0) + (vizDigits ? 10 : 0) + (vizSymbols ? 33 : 0);
  const bitsPerChar    = vizCharsetSize > 0 ? Math.log2(vizCharsetSize) : 0;
  const vizEmpty       = vizCharsetSize === 0;

  const StrengthIcon = result ? STRENGTH_ICONS[result.strengthIndex] : null;

  return (
    <div className="eval">
      <div className="eval__header">
        <div className="eval__header-top">
          <div>
            <h1>Password Evaluation</h1>
            <p>Analyse strength, entropy, and estimated crack times across real attack scenarios.</p>
          </div>
          <button className="eval__compare-btn" onClick={() => navigate('/compare')} title="Compare two passwords">
            <GitCompare size={15} /> Compare
          </button>
        </div>
        <div className="eval__shortcut-hint">
          <kbd>Ctrl</kbd>+<kbd>E</kbd> to focus input
        </div>
      </div>

      {/* ── Input ── */}
      <div className="eval__input-wrap">
        <div className="eval__input-box">
          <input
            ref={inputRef}
            className="eval__input"
            type="text"
            inputMode="text"
            value={password}
            onChange={handleChange}
            placeholder="Type or paste a password to evaluate…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-lpignore="true"
            data-form-type="other"
            aria-label="Password to evaluate"
            style={{ WebkitTextSecurity: showPw ? 'none' : 'disc' }}
          />
          <div className="eval__input-btns">
            <button
              className="eval__input-btn"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {/* Fix #2 — proper Copy icon with copied state */}
            {password && (
              <button
                className={`eval__input-btn ${copied ? 'eval__input-btn--copied' : ''}`}
                onClick={handleCopy}
                aria-label="Copy password"
                title="Copy"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            )}
          </div>
        </div>
        <div className="eval__input-meta">
          <span className="eval__char-count">{password.length} / 128 chars</span>
          {result && <span className="eval__privacy-note"><Info size={11} /> Evaluated locally — never transmitted</span>}
        </div>
      </div>

      {result && (
        <div className="eval__results">

          {/* ── Hero Score ── */}
          <div className="eval__hero" style={{ '--strength-color': result.color }}>
            <div className="eval__hero-left">
              <div className="eval__hero-icon">
                <StrengthIcon size={32} strokeWidth={1.5} style={{ color: result.color }} />
              </div>
              <div>
                <div className="eval__strength-label" style={{ color: result.color }}>{result.strength}</div>
                <div className="eval__entropy-display">
                  <span className="eval__entropy-value">{result.entropy}</span>
                  <span className="eval__entropy-unit">bits entropy</span>
                </div>
              </div>
            </div>

            {/* Fix #16 — accessible strength bar */}
            <div
              className="eval__seg-bar"
              role="meter"
              aria-label={`Password strength: ${result.strength} (${result.strengthIndex + 1} of 5)`}
              aria-valuenow={result.strengthIndex + 1}
              aria-valuemin={1}
              aria-valuemax={5}
            >
              <div className="eval__seg-row" aria-hidden="true">
                {[0,1,2,3,4].map(i => (
                  <div
                    key={i}
                    className={`eval__seg ${i <= result.strengthIndex ? 'eval__seg--filled' : ''}`}
                    style={{ '--seg-c': i <= result.strengthIndex ? result.color : undefined }}
                  />
                ))}
              </div>
              <div className="eval__seg-labels" aria-hidden="true">
                {['Very Weak','Weak','Fair','Strong','Very Strong'].map(l => <span key={l}>{l}</span>)}
              </div>
            </div>
          </div>

          {/* ── Crack Times ── */}
          <section className="eval__section">
            <h2 className="eval__section-title"><Clock size={15} /> Crack Time Estimates</h2>
            <div className="eval__crack-grid">
              {Object.entries(CRACK_SCENARIOS).map(([key, { label, sub, icon }]) => (
                <div className="eval__crack-card" key={key}>
                  <div className="eval__crack-icon">{icon}</div>
                  <div className="eval__crack-info">
                    <span className="eval__crack-label">{label}</span>
                    <span className="eval__crack-sub">{sub}</span>
                  </div>
                  <div className="eval__crack-time" style={{ color: getCrackColor(result.crackTimes[key]) }}>
                    {result.crackTimes[key]}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Checklist ── */}
          <section className="eval__section">
            <h2 className="eval__section-title"><ShieldCheck size={15} /> Checklist</h2>
            <div className="eval__checklist">
              {Object.entries(result.inclusions).map(([key, { pass, label }]) => (
                <div key={key} className={`eval__check-item ${pass ? 'eval__check-item--pass' : 'eval__check-item--fail'}`}>
                  <span className="eval__check-icon" aria-hidden="true">{pass ? '✓' : '✗'}</span>
                  <span className="eval__check-label">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Penalties ── */}
          {result.penalties.length > 0 && (
            <section className="eval__section">
              <h2 className="eval__section-title"><Zap size={15} /> Detected Patterns (Entropy Deducted)</h2>
              <div className="eval__penalties">
                {result.penalties.map(({ label, bits }) => (
                  <div key={label} className="eval__penalty">
                    <span className="eval__penalty-label">{label}</span>
                    <span className="eval__penalty-bits">−{bits} bits</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Suggestions ── */}
          {result.suggestions.length > 0 && (
            <section className="eval__section">
              <h2 className="eval__section-title"><Info size={15} /> Suggestions</h2>
              <ul className="eval__suggestions" role="list">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="eval__suggestion">{s}</li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Score Breakdown (collapsible) ── */}
          <section className="eval__section eval__section--collapsible">
            <button
              className="eval__breakdown-toggle"
              onClick={() => setShowBreakdown(v => !v)}
              aria-expanded={showBreakdown}
              aria-controls="eval-breakdown-body"
            >
              <span className="eval__section-title" style={{ margin: 0 }}>
                <Zap size={15} /> How was this score calculated?
              </span>
              {showBreakdown ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {showBreakdown && (
              <div id="eval-breakdown-body" className="eval__breakdown">
                <div className="eval__breakdown-row">
                  <span>Password length</span>
                  <span className="eval__breakdown-val">{result.length} characters</span>
                </div>
                <div className="eval__breakdown-row">
                  <span>Character set size</span>
                  <span className="eval__breakdown-val">{result.charsetSize} possible characters</span>
                </div>
                <div className="eval__breakdown-row">
                  <span>Raw entropy formula</span>
                  <span className="eval__breakdown-val mono">{result.length} × log₂({result.charsetSize}) = {result.rawEntropy} bits</span>
                </div>
                <div className="eval__breakdown-row">
                  <span>Pattern penalties applied</span>
                  <span className="eval__breakdown-val" style={{ color: result.penalties.length ? 'var(--warning)' : 'var(--safe)' }}>
                    {result.penalties.length ? `−${result.penalties.reduce((s,p) => s+p.bits, 0)} bits` : 'None'}
                  </span>
                </div>
                <div className="eval__breakdown-row eval__breakdown-row--total">
                  <span>Final entropy</span>
                  <span className="eval__breakdown-val" style={{ color: result.color }}>{result.entropy} bits</span>
                </div>
                <p className="eval__breakdown-note">
                  Each additional bit of entropy doubles the number of guesses an attacker needs.
                  80+ bits is considered very strong for offline attacks.
                </p>
              </div>
            )}
          </section>

          {/* ── Meta chips ── */}
          <div className="eval__meta-row">
            <div className="eval__meta-chip">
              <span className="eval__meta-key">Length</span>
              <span className="eval__meta-val">{result.length}</span>
            </div>
            <div className="eval__meta-chip">
              <span className="eval__meta-key">Charset</span>
              <span className="eval__meta-val">{result.charsetSize} chars</span>
            </div>
            <div className="eval__meta-chip">
              <span className="eval__meta-key">Score</span>
              <span className="eval__meta-val">{result.score}/100</span>
            </div>
          </div>

        </div>
      )}

      {/* ── Entropy Visualizer ── */}
      <section className="eval__viz">
        <div className="eval__viz-header">
          <h2 className="eval__section-title" style={{ margin: 0 }}><Info size={15} /> Entropy Visualizer</h2>
          <p className="eval__viz-sub">See how character sets affect strength. No password needed.</p>
        </div>

        <div className="eval__viz-controls">
          {[
            ['Uppercase A–Z (+26)', vizUpper,   setVizUpper],
            ['Lowercase a–z (+26)', vizLower,   setVizLower],
            ['Numbers 0–9 (+10)',   vizDigits,  setVizDigits],
            ['Symbols (+33)',       vizSymbols, setVizSymbols],
          ].map(([label, val, setter]) => (
            <label key={label} className="eval__viz-toggle">
              <input type="checkbox" checked={val} onChange={() => setter(v => !v)} />
              <span className="eval__viz-track"><span className="eval__viz-thumb" /></span>
              <span>{label}</span>
            </label>
          ))}
        </div>

        {/* Fix #11 — show message when no charset selected */}
        {vizEmpty ? (
          <div className="eval__viz-empty">
            Select at least one character type to see entropy estimates.
          </div>
        ) : (
          <>
            <div className="eval__viz-stats">
              <div className="eval__viz-stat">
                <span className="eval__viz-stat-val">{vizCharsetSize}</span>
                <span className="eval__viz-stat-label">Charset size</span>
              </div>
              <div className="eval__viz-stat">
                <span className="eval__viz-stat-val">{bitsPerChar.toFixed(2)}</span>
                <span className="eval__viz-stat-label">Bits per character</span>
              </div>
            </div>

            <div className="eval__viz-table" role="table" aria-label="Entropy by password length">
              <div className="eval__viz-table-head" role="row">
                <span role="columnheader">Length</span>
                <span role="columnheader">Total entropy</span>
                <span role="columnheader">Offline (bcrypt)</span>
                <span role="columnheader">Strength</span>
              </div>
              {VIZ_PRESETS.map(len => {
                const ent = len * bitsPerChar;
                const crackSec = Math.pow(2, ent) / 1e4;
                const [str, col] = getVizStrength(ent);
                return (
                  <div key={len} className="eval__viz-table-row" role="row">
                    <span className="eval__viz-len" role="cell">{len} chars</span>
                    <span className="eval__viz-ent mono" role="cell">{ent.toFixed(1)} bits</span>
                    <span className="eval__viz-crack" style={{ color: col }} role="cell">{formatVizTime(crackSec)}</span>
                    <span className="eval__viz-str" style={{ color: col }} role="cell">{str}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {!password && (
        <div className="eval__empty">
          <ShieldCheck size={48} strokeWidth={1} />
          <p>Type a password above to see the full analysis.</p>
          <p className="eval__empty-note">Your password is never transmitted or stored.</p>
        </div>
      )}
    </div>
  );
}

function formatVizTime(seconds) {
  if (!isFinite(seconds) || seconds > 1e18) return 'Centuries';
  if (seconds < 1)       return 'Instantly';
  if (seconds < 60)      return `${Math.round(seconds)}s`;
  if (seconds < 3600)    return `${Math.round(seconds/60)}min`;
  if (seconds < 86400)   return `${Math.round(seconds/3600)}hrs`;
  if (seconds < 2592000) return `${Math.round(seconds/86400)}days`;
  if (seconds < 31536000) return `${Math.round(seconds/2592000)}mo`;
  const y = seconds/31536000;
  if (y < 1e3) return `${Math.round(y)}yrs`;
  if (y < 1e6) return `${(y/1e3).toFixed(0)}K yrs`;
  if (y < 1e9) return `${(y/1e6).toFixed(0)}M yrs`;
  return 'Centuries';
}

function getVizStrength(entropy) {
  if (entropy < 28) return ['Very Weak', '#FF4545'];
  if (entropy < 40) return ['Weak',      '#FF7020'];
  if (entropy < 60) return ['Fair',      '#FFD020'];
  if (entropy < 80) return ['Strong',    '#00C96E'];
  return              ['Very Strong', '#00FF8A'];
}
