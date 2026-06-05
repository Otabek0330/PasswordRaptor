import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Search, ShieldCheck, ShieldX, AlertTriangle, Info, Copy, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import './BreachCheck.css';

function sanitizeHtml(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('a').forEach(a => {
    a.replaceWith(document.createTextNode(`${a.textContent} (${a.href})`));
  });
  return div.textContent || div.innerText || '';
}

async function checkPasswordBreach(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  });
  if (!res.ok) throw new Error(`HIBP API error: ${res.status}`);

  const text = await res.text();
  const match = text.split('\n').find(l => l.toUpperCase().startsWith(suffix));

  if (match) {
    const count = parseInt(match.split(':')[1].trim(), 10);
    return { found: true, count };
  }
  return { found: false, count: 0 };
}

export default function BreachCheck() {
  const { showToast } = useToast();

  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    document.title = 'Password Raptor | Breach Check';
  }, []);

  const handleCheck = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await checkPasswordBreach(password);
      setResult(res);
    } catch {
      setError('Failed to reach the HIBP API. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      showToast('Password copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCheck();
  };

  return (
    <div className="breach">
      <div className="breach__header">
        <h1>Breach Check</h1>
        <p>
          Check if your password has appeared in known data breaches, powered by{' '}
          <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="breach__hibp-link">
            HaveIBeenPwned
          </a>.
        </p>
      </div>

      {/* Privacy note */}
      <div className="breach__privacy-note">
        <Info size={13} />
        <span>
          Only the first <strong>5 characters</strong> of a SHA-1 hash are sent to the API (k-Anonymity).
          Your password is never transmitted in full.
        </span>
      </div>

      {/* Input */}
      <div className="breach__input-row">
        <div className="breach__input-box">
          <input
            type="text"
            inputMode="text"
            className="breach__input"
            value={password}
            onChange={e => {
              setPassword(e.target.value.slice(0, 128));
              setResult(null);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter a password to check…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-lpignore="true"
            data-form-type="other"
            style={{ WebkitTextSecurity: showPw ? 'none' : 'disc' }}
          />
          <button
            className="breach__eye"
            onClick={() => setShowPw(v => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          className="breach__check-btn"
          onClick={handleCheck}
          disabled={loading || !password.trim()}
        >
          {loading ? <span className="breach__spinner" /> : <Search size={16} />}
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="breach__error">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Result */}
      {result && !error && (
        <div className={`breach__result ${result.found ? 'breach__result--danger' : 'breach__result--safe'}`}>
          <div className="breach__result-icon">
            {result.found ? <ShieldX size={28} /> : <ShieldCheck size={28} />}
          </div>
          <div className="breach__result-body">
            {result.found ? (
              <>
                <strong>Password compromised</strong>
                <p>
                  This password has appeared in data breaches{' '}
                  <span className="breach__count">{result.count.toLocaleString()}</span> times.
                  Stop using it immediately and replace it with a unique, strong password.
                </p>
              </>
            ) : (
              <>
                <strong>Not found in any breach</strong>
                <p>
                  This password doesn't appear in any known breach database.
                  Keep it private and never reuse it across sites.
                </p>
              </>
            )}
          </div>
          {password && (
            <button
              className={`breach__copy-btn ${copied ? 'breach__copy-btn--done' : ''}`}
              onClick={handleCopy}
              title="Copy password"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
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
              <p>Your password is hashed with SHA-1 entirely in your browser using the Web Crypto API.</p>
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
              <p>HIBP returns ~800 hashes sharing that prefix. We match locally — your full hash never leaves your device.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="breach__info-grid">
        <div className="breach__info-card">
          <h4>Is my full password sent to the internet?</h4>
          <p>
            No. Only the first 5 characters of a hashed version of your password are sent.
            This k-Anonymity technique means your actual password is never revealed, transmitted, or stored anywhere.
          </p>
        </div>
        <div className="breach__info-card">
          <h4>What if my password is found?</h4>
          <p>
            It means your password appeared in at least one known data leak.
            Stop using it immediately on all sites, generate a new unique password, and enable two-factor authentication where possible.
          </p>
        </div>
      </div>
    </div>
  );
}
