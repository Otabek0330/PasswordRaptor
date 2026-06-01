import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Search, ShieldCheck, ShieldX, AlertTriangle, Mail, Lock, ExternalLink, ChevronDown, ChevronUp, Info } from 'lucide-react';
import './BreachCheck.css';

// k-Anonymity SHA-1 prefix lookup for passwords
async function checkPasswordBreach(password) {
  // We use the Web Crypto API for SHA-1 (fine here — not for security, only for HIBP lookup)
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  });
  if (!res.ok) throw new Error(`HIBP API error: ${res.status}`);

  const text = await res.text();
  const lines = text.split('\n');
  const match = lines.find(l => l.toUpperCase().startsWith(suffix));

  if (match) {
    const count = parseInt(match.split(':')[1].trim(), 10);
    return { found: true, count };
  }
  return { found: false, count: 0 };
}

// Email breach lookup — HIBP /breachedaccount requires an API key AND blocks browser
// CORS requests, so we skip that call entirely and go straight to the public fallback:
// show all known breaches from the public /breaches endpoint so the user can cross-reference.
async function checkEmailBreach(_email) {
  // Always throw API_KEY_REQUIRED so we fall through to the public breach list.
  // This keeps the UI honest and avoids CORS errors.
  throw new Error('API_KEY_REQUIRED');
}

// Fetch all breaches from HIBP public endpoint (no API key needed)
async function fetchAllBreaches() {
  const res = await fetch('https://haveibeenpwned.com/api/v3/breaches');
  if (!res.ok) throw new Error('Failed to fetch breach database');
  return res.json();
}

const SEVERITY_COLORS = {
  high:   'var(--danger)',
  medium: 'var(--warning)',
  low:    'var(--caution)',
  safe:   'var(--safe)',
};

export default function BreachCheck() {
  const [mode, setMode] = useState('password'); // 'password' | 'email'

  // Password state
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [pwResult, setPwResult]   = useState(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]     = useState('');

  // Email state
  const [email, setEmail]           = useState('');
  const [emailResult, setEmailResult] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [allBreaches, setAllBreaches] = useState([]);
  const [expandedBreach, setExpandedBreach] = useState(null);

  useEffect(() => {
    document.title = 'Password Raptor | Breach Check';
  }, []);

  // ── Password check ──
  const handlePasswordCheck = async () => {
    if (!password.trim()) return;
    setPwLoading(true);
    setPwError('');
    setPwResult(null);
    try {
      const result = await checkPasswordBreach(password);
      setPwResult(result);
    } catch (err) {
      setPwError('Failed to reach the HIBP API. Check your connection and try again.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Email check ──
  const handleEmailCheck = async () => {
    if (!email.trim()) return;
    if (!isValidEmail(email)) { setEmailError('Please enter a valid email address.'); return; }
    setEmailLoading(true);
    setEmailError('');
    setEmailResult(null);
    setAllBreaches([]);

    try {
      const result = await checkEmailBreach(email);
      setEmailResult(result);
    } catch (err) {
      if (err.message === 'API_KEY_REQUIRED') {
        // Fall back: load all breaches publicly and inform user
        setEmailError('api_key_required');
        try {
          const all = await fetchAllBreaches();
          setAllBreaches(all);
        } catch {
          setEmailError('network_error');
        }
      } else if (err.message === 'RATE_LIMITED') {
        setEmailError('rate_limited');
      } else {
        setEmailError('network_error');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleKeyDown = (e, fn) => {
    if (e.key === 'Enter') fn();
  };

  return (
    <div className="breach">
      <div className="breach__header">
        <h1>Breach Check</h1>
        <p>
          Check if your password or email has appeared in known data breaches,
          powered by <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="breach__hibp-link">HaveIBeenPwned</a>.
        </p>
      </div>

      {/* ── Mode Tabs ── */}
      <div className="breach__tabs">
        <button
          className={`breach__tab ${mode === 'password' ? 'breach__tab--active' : ''}`}
          onClick={() => { setMode('password'); setPwResult(null); setPwError(''); }}
        >
          <Lock size={15} /> Password
        </button>
        <button
          className={`breach__tab ${mode === 'email' ? 'breach__tab--active' : ''}`}
          onClick={() => { setMode('email'); setEmailResult(null); setEmailError(''); setAllBreaches([]); }}
        >
          <Mail size={15} /> Email Address
        </button>
      </div>

      {/* ══════════ PASSWORD MODE ══════════ */}
      {mode === 'password' && (
        <div className="breach__panel">
          <div className="breach__privacy-note">
            <Info size={13} />
            <span>
              Only the first <strong>5 characters</strong> of a SHA-1 hash are sent to the API (k-Anonymity).
              Your password is never transmitted in full.
            </span>
          </div>

          <div className="breach__input-row">
            <div className="breach__input-box">
              <input
                type="text"
                inputMode="text"
                className="breach__input"
                value={password}
                onChange={e => { setPassword(e.target.value.slice(0, 128)); setPwResult(null); setPwError(''); }}
                onKeyDown={e => handleKeyDown(e, handlePasswordCheck)}
                placeholder="Enter a password to check…"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-form-type="other"
                style={{ WebkitTextSecurity: showPw ? 'none' : 'disc' }}
              />
              <button className="breach__eye" onClick={() => setShowPw(v => !v)} aria-label="Toggle visibility">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              className="breach__check-btn"
              onClick={handlePasswordCheck}
              disabled={pwLoading || !password.trim()}
            >
              {pwLoading ? <span className="breach__spinner" /> : <Search size={16} />}
              {pwLoading ? 'Checking…' : 'Check'}
            </button>
          </div>

          {pwError && (
            <div className="breach__error">
              <AlertTriangle size={15} /> {pwError}
            </div>
          )}

          {pwResult && !pwError && (
            <div className={`breach__result ${pwResult.found ? 'breach__result--danger' : 'breach__result--safe'}`}>
              {pwResult.found ? (
                <>
                  <div className="breach__result-icon"><ShieldX size={28} /></div>
                  <div className="breach__result-body">
                    <strong>Password compromised</strong>
                    <p>
                      This password has appeared in data breaches{' '}
                      <span className="breach__count">{pwResult.count.toLocaleString()}</span> times.
                      Stop using it immediately and replace it with a unique, strong password.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="breach__result-icon"><ShieldCheck size={28} /></div>
                  <div className="breach__result-body">
                    <strong>Not found in any breach</strong>
                    <p>
                      This password does not appear in any known data breach database.
                      Keep it private and never reuse it across sites.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* How it works */}
          <div className="breach__explainer">
            <h3>How does this work?</h3>
            <div className="breach__steps">
              <div className="breach__step">
                <span className="breach__step-num">1</span>
                <div>
                  <strong>Local hashing</strong>
                  <p>Your password is hashed with SHA-1 entirely in your browser.</p>
                </div>
              </div>
              <div className="breach__step">
                <span className="breach__step-num">2</span>
                <div>
                  <strong>Prefix sent</strong>
                  <p>Only the first 5 characters (out of 40) of the hash are sent to HIBP.</p>
                </div>
              </div>
              <div className="breach__step">
                <span className="breach__step-num">3</span>
                <div>
                  <strong>Local matching</strong>
                  <p>HIBP returns ~800 hashes that share that prefix. We match locally — your full hash never leaves your device.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ EMAIL MODE ══════════ */}
      {mode === 'email' && (
        <div className="breach__panel">
          <div className="breach__privacy-note">
            <Info size={13} />
            <span>
              Email breach lookups query the <strong>HaveIBeenPwned</strong> API directly.
              Your email address is transmitted over HTTPS to perform the lookup.
            </span>
          </div>

          <div className="breach__input-row">
            <div className="breach__input-box">
              <input
                type="email"
                className="breach__input"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailResult(null); setEmailError(''); setAllBreaches([]); }}
                onKeyDown={e => handleKeyDown(e, handleEmailCheck)}
                placeholder="Enter an email address to check…"
                autoComplete="off"
              />
            </div>
            <button
              className="breach__check-btn"
              onClick={handleEmailCheck}
              disabled={emailLoading || !email.trim()}
            >
              {emailLoading ? <span className="breach__spinner" /> : <Search size={16} />}
              {emailLoading ? 'Checking…' : 'Check'}
            </button>
          </div>

          {/* API key required fallback */}
          {emailError === 'api_key_required' && (
            <div className="breach__api-notice">
              <AlertTriangle size={15} />
              <div>
                <strong>Direct email lookup requires an API key.</strong>
                <p>
                  The HaveIBeenPwned API requires a paid API key to check individual email addresses.
                  You can check your email directly on{' '}
                  <a href={`https://haveibeenpwned.com/account/${encodeURIComponent(email)}`} target="_blank" rel="noopener noreferrer" className="breach__hibp-link">
                    haveibeenpwned.com <ExternalLink size={11} />
                  </a>.
                </p>
                {allBreaches.length > 0 && (
                  <p className="breach__all-breaches-note">
                    Below are all <strong>{allBreaches.length}</strong> known breaches in the HIBP database
                    so you can identify which services you've used that were affected.
                  </p>
                )}
              </div>
            </div>
          )}

          {emailError === 'rate_limited' && (
            <div className="breach__error">
              <AlertTriangle size={15} /> Rate limited. Please wait a moment and try again.
            </div>
          )}

          {emailError === 'network_error' && (
            <div className="breach__error">
              <AlertTriangle size={15} /> Could not connect to the HIBP API. Check your connection.
            </div>
          )}

          {!emailError && emailError !== 'api_key_required' && emailResult && (
            <div className={`breach__result ${emailResult.found ? 'breach__result--danger' : 'breach__result--safe'}`}>
              {emailResult.found ? (
                <>
                  <div className="breach__result-icon"><ShieldX size={28} /></div>
                  <div className="breach__result-body">
                    <strong>Email found in {emailResult.breaches.length} breach{emailResult.breaches.length !== 1 ? 'es' : ''}</strong>
                    <p>Your email address has appeared in known data breaches. Review the list below and secure any affected accounts.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="breach__result-icon"><ShieldCheck size={28} /></div>
                  <div className="breach__result-body">
                    <strong>No breaches found</strong>
                    <p>This email address was not found in any known data breach. Stay vigilant and use strong, unique passwords.</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Breach list from direct email lookup */}
          {emailResult?.found && emailResult.breaches.length > 0 && (
            <BreachList breaches={emailResult.breaches} expanded={expandedBreach} setExpanded={setExpandedBreach} />
          )}

          {/* Breach list fallback — all breaches */}
          {emailError === 'api_key_required' && allBreaches.length > 0 && (
            <BreachList breaches={allBreaches} expanded={expandedBreach} setExpanded={setExpandedBreach} showAllNote />
          )}
        </div>
      )}
    </div>
  );
}

function BreachList({ breaches, expanded, setExpanded, showAllNote }) {
  const [filter, setFilter] = useState('');
  const filtered = breaches.filter(b =>
    b.Name.toLowerCase().includes(filter.toLowerCase()) ||
    b.Domain?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="breach__list-wrap">
      {showAllNote && (
        <p className="breach__list-note">
          Showing all {breaches.length} known breaches. Cross-reference with services you've used.
        </p>
      )}
      <input
        type="text"
        className="breach__filter-input"
        placeholder={`Filter ${breaches.length} breaches…`}
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <div className="breach__list">
        {filtered.map(b => (
          <BreachCard
            key={b.Name}
            breach={b}
            isExpanded={expanded === b.Name}
            onToggle={() => setExpanded(expanded === b.Name ? null : b.Name)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="breach__list-empty">No breaches match your filter.</p>
        )}
      </div>
    </div>
  );
}

function BreachCard({ breach, isExpanded, onToggle }) {
  const isSensitive = breach.IsSensitive;
  const isRetired   = breach.IsRetired;
  const dataClasses = breach.DataClasses || [];

  const severity = dataClasses.includes('Passwords')
    ? 'high'
    : dataClasses.includes('Email addresses') || dataClasses.includes('Phone numbers')
    ? 'medium'
    : 'low';

  return (
    <div className={`breach__card breach__card--${severity}`}>
      <button className="breach__card-header" onClick={onToggle}>
        <div className="breach__card-left">
          {breach.LogoPath ? (
            <img
              src={breach.LogoPath}
              alt={`${breach.Name} logo`}
              className="breach__card-logo"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="breach__card-logo-placeholder">
              {breach.Name.charAt(0)}
            </div>
          )}
          <div className="breach__card-title">
            <span className="breach__card-name">{breach.Title || breach.Name}</span>
            {breach.Domain && (
              <span className="breach__card-domain">{breach.Domain}</span>
            )}
          </div>
        </div>
        <div className="breach__card-right">
          <span className="breach__card-date">
            {new Date(breach.BreachDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span className={`breach__card-severity breach__card-severity--${severity}`}>
            {severity}
          </span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {isExpanded && (
        <div className="breach__card-body">
          <div
            className="breach__card-desc"
            dangerouslySetInnerHTML={{ __html: breach.Description }}
          />

          <div className="breach__card-meta">
            <div className="breach__card-meta-item">
              <span className="breach__card-meta-key">Records exposed</span>
              <span className="breach__card-meta-val">{(breach.PwnCount || 0).toLocaleString()}</span>
            </div>
            <div className="breach__card-meta-item">
              <span className="breach__card-meta-key">Breach date</span>
              <span className="breach__card-meta-val">
                {new Date(breach.BreachDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="breach__card-meta-item">
              <span className="breach__card-meta-key">Added to HIBP</span>
              <span className="breach__card-meta-val">
                {new Date(breach.AddedDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
              </span>
            </div>
            {isSensitive && (
              <div className="breach__card-meta-item">
                <span className="breach__card-meta-key">Sensitive breach</span>
                <span className="breach__card-meta-val breach__card-meta-val--warn">Yes</span>
              </div>
            )}
          </div>

          <div className="breach__card-classes">
            <span className="breach__card-classes-label">Data exposed:</span>
            <div className="breach__card-classes-list">
              {dataClasses.map(dc => (
                <span
                  key={dc}
                  className={`breach__data-class ${dc === 'Passwords' ? 'breach__data-class--critical' : ''}`}
                >
                  {dc}
                </span>
              ))}
            </div>
          </div>

          {breach.Domain && (
            <a
              href={`https://${breach.Domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="breach__card-link"
            >
              Visit {breach.Domain} <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
