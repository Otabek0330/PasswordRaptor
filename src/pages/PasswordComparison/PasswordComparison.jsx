import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, GitCompare, Trophy, Minus } from 'lucide-react';
import { evaluatePassword } from '../../utils/passwordStrength.js';
import { useToast } from '../../context/ToastContext.jsx';
import './PasswordComparison.css';

const CRACK_LABELS = {
  online:       'Online attack',
  offline_slow: 'Offline (bcrypt)',
  offline_fast: 'Offline (MD5/GPU)',
};

export default function PasswordComparison() {
  const { showToast } = useToast();
  const [pwA, setPwA] = useState('');
  const [pwB, setPwB] = useState('');
  const [showA, setShowA] = useState(false);
  const [showB, setShowB] = useState(false);
  const [evalA, setEvalA] = useState(null);
  const [evalB, setEvalB] = useState(null);

  useEffect(() => {
    document.title = 'Password Raptor | Compare';
  }, []);

  const handleA = useCallback(e => {
    const v = e.target.value.slice(0, 128);
    setPwA(v);
    setEvalA(v ? evaluatePassword(v) : null);
  }, []);

  const handleB = useCallback(e => {
    const v = e.target.value.slice(0, 128);
    setPwB(v);
    setEvalB(v ? evaluatePassword(v) : null);
  }, []);

  const winner = evalA && evalB
    ? evalA.entropy > evalB.entropy ? 'A'
    : evalB.entropy > evalA.entropy ? 'B'
    : 'tie'
    : null;

  return (
    <div className="cmp">
      <div className="cmp__header">
        <GitCompare size={24} />
        <div>
          <h1>Password Comparison</h1>
          <p>Enter two passwords side by side to see which is stronger and why.</p>
        </div>
      </div>

      {/* ── Winner Banner ── */}
      {winner && (
        <div className={`cmp__banner cmp__banner--${winner}`}>
          {winner === 'tie' ? (
            <><Minus size={18} /> Both passwords are equally strong</>
          ) : (
            <><Trophy size={18} /> Password {winner} is stronger by {Math.abs((evalA?.entropy ?? 0) - (evalB?.entropy ?? 0)).toFixed(1)} bits</>
          )}
        </div>
      )}

      {/* ── Side-by-side inputs ── */}
      <div className="cmp__grid">
        <PasswordPanel
          label="Password A"
          value={pwA}
          show={showA}
          onToggleShow={() => setShowA(v => !v)}
          onChange={handleA}
          result={evalA}
          isWinner={winner === 'A'}
          isLoser={winner === 'B'}
          showToast={showToast}
        />
        <PasswordPanel
          label="Password B"
          value={pwB}
          show={showB}
          onToggleShow={() => setShowB(v => !v)}
          onChange={handleB}
          result={evalB}
          isWinner={winner === 'B'}
          isLoser={winner === 'A'}
          showToast={showToast}
        />
      </div>

      {/* ── Full comparison table ── */}
      {evalA && evalB && (
        <div className="cmp__table-wrap">
          <h2 className="cmp__table-title">Side-by-side breakdown</h2>
          <div className="cmp__table">
            <div className="cmp__table-head">
              <span>Metric</span>
              <span>Password A</span>
              <span>Password B</span>
            </div>

            <CompRow label="Strength"
              a={<span style={{ color: evalA.color, fontWeight: 700 }}>{evalA.strength}</span>}
              b={<span style={{ color: evalB.color, fontWeight: 700 }}>{evalB.strength}</span>}
              winnerCol={evalA.strengthIndex > evalB.strengthIndex ? 'a' : evalB.strengthIndex > evalA.strengthIndex ? 'b' : null}
            />
            <CompRow label="Entropy"
              a={`${evalA.entropy} bits`}
              b={`${evalB.entropy} bits`}
              winnerCol={evalA.entropy > evalB.entropy ? 'a' : evalB.entropy > evalA.entropy ? 'b' : null}
            />
            <CompRow label="Length"
              a={`${evalA.length} chars`}
              b={`${evalB.length} chars`}
              winnerCol={evalA.length > evalB.length ? 'a' : evalB.length > evalA.length ? 'b' : null}
            />
            <CompRow label="Charset size"
              a={`${evalA.charsetSize}`}
              b={`${evalB.charsetSize}`}
              winnerCol={evalA.charsetSize > evalB.charsetSize ? 'a' : evalB.charsetSize > evalA.charsetSize ? 'b' : null}
            />
            <CompRow label="Penalties"
              a={<span style={{ color: evalA.penalties.length ? 'var(--warning)' : 'var(--safe)' }}>{evalA.penalties.length || 'None'}</span>}
              b={<span style={{ color: evalB.penalties.length ? 'var(--warning)' : 'var(--safe)' }}>{evalB.penalties.length || 'None'}</span>}
              winnerCol={evalA.penalties.length < evalB.penalties.length ? 'a' : evalB.penalties.length < evalA.penalties.length ? 'b' : null}
            />

            {Object.entries(CRACK_LABELS).map(([key, label]) => (
              <CompRow key={key} label={label}
                a={evalA.crackTimes[key]}
                b={evalB.crackTimes[key]}
                mono
              />
            ))}
          </div>
        </div>
      )}

      {(!pwA && !pwB) && (
        <div className="cmp__empty">
          <GitCompare size={44} strokeWidth={1} />
          <p>Enter passwords in both fields to start comparing.</p>
        </div>
      )}
    </div>
  );
}

function PasswordPanel({ label, value, show, onToggleShow, onChange, result, isWinner, isLoser, showToast }) {
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => showToast(`${label} copied`, 'success'));
  };

  return (
    <div className={`cmp__panel ${isWinner ? 'cmp__panel--winner' : ''} ${isLoser ? 'cmp__panel--loser' : ''}`}>
      <div className="cmp__panel-label">
        {isWinner && <Trophy size={13} style={{ color: 'var(--caution)' }} />}
        {label}
      </div>

      <div className="cmp__input-box">
        <input
          className="cmp__input"
          type="text"
          inputMode="text"
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label}…`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          data-lpignore="true"
          data-form-type="other"
          style={{ WebkitTextSecurity: show ? 'none' : 'disc' }}
        />
        <button className="cmp__input-btn" onClick={onToggleShow}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>

      {result && (
        <div className="cmp__panel-result">
          {/* Strength bar */}
          <div className="cmp__seg-bar">
            {[0,1,2,3,4].map(i => (
              <div key={i}
                className={`cmp__seg ${i <= result.strengthIndex ? 'cmp__seg--filled' : ''}`}
                style={{ '--sc': i <= result.strengthIndex ? result.color : undefined }}
              />
            ))}
          </div>

          <div className="cmp__panel-meta">
            <span style={{ color: result.color, fontWeight: 700 }}>{result.strength}</span>
            <span className="cmp__entropy">{result.entropy} bits</span>
          </div>

          {/* Checklist compact */}
          <div className="cmp__checks">
            {Object.entries(result.inclusions).slice(0, 6).map(([key, { pass, label }]) => (
              <span key={key} className={`cmp__check ${pass ? 'cmp__check--pass' : 'cmp__check--fail'}`}>
                {pass ? '✓' : '✗'} {label}
              </span>
            ))}
          </div>

          {/* Penalties */}
          {result.penalties.length > 0 && (
            <div className="cmp__penalties">
              {result.penalties.map(p => (
                <span key={p.label} className="cmp__penalty">⚠ {p.label}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompRow({ label, a, b, winnerCol, mono }) {
  return (
    <div className="cmp__table-row">
      <span className="cmp__table-label">{label}</span>
      <span className={`cmp__table-val ${winnerCol === 'a' ? 'cmp__table-val--win' : ''} ${mono ? 'mono' : ''}`}>{a}</span>
      <span className={`cmp__table-val ${winnerCol === 'b' ? 'cmp__table-val--win' : ''} ${mono ? 'mono' : ''}`}>{b}</span>
    </div>
  );
}
