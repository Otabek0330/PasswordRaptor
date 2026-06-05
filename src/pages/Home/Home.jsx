import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, ShieldCheck, Search, ArrowRight, Lock } from 'lucide-react';
import './Home.css';

const FEATURES = [
  {
    icon: Wand2,
    title: 'Password Creation',
    desc: 'Generate random passwords, passphrases, memorable passwords, or custom word-based passwords — with full control over character sets and length.',
    path: '/create',
    badge: 'Generator',
  },
  {
    icon: ShieldCheck,
    title: 'Strength Evaluation',
    desc: 'Evaluate any password using entropy analysis, pattern detection, and realistic crack-time estimates across three attack scenarios.',
    path: '/evaluate',
    badge: 'Evaluator',
  },
  {
    icon: Search,
    title: 'Breach Check',
    desc: 'Check if a password or email has appeared in known data breaches using the HaveIBeenPwned database with full k-anonymity privacy.',
    path: '/breach',
    badge: 'Breach Intel',
  },
];

const STATS = [
  { value: '10B+',    label: 'Breached records in HIBP' },
  { value: '128-bit', label: 'Target entropy for very strong passwords' },
  { value: '0',       label: 'Passwords stored or sent to our servers' },
];

export default function Home() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.title = 'Password Raptor';
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`home ${visible ? 'home--visible' : ''}`}>

      {/* ── HERO ── */}
      <section className="home__hero" aria-label="Hero">
        <div className="home__hero-glow" aria-hidden="true" />

        <div className="home__hero-content">
          <div className="home__badge">
            <Lock size={12} />
            Privacy-first · Runs locally
          </div>

          <h1 className="home__title">
            Protect your
            <span className="home__title-accent"> digital identity</span>
            <br />with intelligent password tools.
          </h1>

          <p className="home__subtitle">
            Generate unbreakable passwords, evaluate your current ones against
            real-world attack scenarios, and check if they've been exposed in
            data breaches — all without leaving your browser.
          </p>

          <div className="home__cta">
            <button className="btn-primary" onClick={() => navigate('/create')}>
              <Wand2 size={16} />
              Start Generating
              <ArrowRight size={16} />
            </button>
            <button className="btn-ghost" onClick={() => navigate('/evaluate')}>
              Evaluate a Password
            </button>
          </div>
        </div>

        {/* Animated terminal card */}
        <div className="home__terminal" aria-hidden="true">
          <div className="home__terminal-bar">
            <span className="home__terminal-dot home__terminal-dot--red" />
            <span className="home__terminal-dot home__terminal-dot--yellow" />
            <span className="home__terminal-dot home__terminal-dot--green" />
            <span className="home__terminal-title">raptor — entropy analysis</span>
          </div>
          <div className="home__terminal-body">
            <TerminalLines />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="home__stats" aria-label="Stats">
        {STATS.map(({ value, label }) => (
          <div className="home__stat" key={label}>
            <span className="home__stat-value">{value}</span>
            <span className="home__stat-label">{label}</span>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section className="home__features" aria-label="Features">
        <div className="home__features-header">
          <h2>Everything you need.</h2>
          <p>Three powerful tools, one seamless experience.</p>
        </div>

        <div className="home__feature-grid">
          {FEATURES.map(({ icon: Icon, title, desc, path, badge }, i) => (
            <button
              key={title}
              className="home__feature-card"
              onClick={() => navigate(path)}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="home__feature-top">
                <div className="home__feature-icon">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <span className="home__feature-badge">{badge}</span>
              </div>
              <h3 className="home__feature-title">{title}</h3>
              <p className="home__feature-desc">{desc}</p>
              <div className="home__feature-arrow">
                Open tool <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── PRIVACY NOTE ── */}
      <section className="home__privacy">
        <div className="home__privacy-inner">
          <ShieldCheck size={20} />
          <div>
            <strong>Your data never leaves your device.</strong>
            <span> Password generation and strength evaluation run entirely in your browser.
              Breach lookups use k-anonymity — only a 5-character hash prefix is sent to the API, never your full password.</span>
          </div>
        </div>
      </section>

    </div>
  );
}

const LINES = [
  { delay: 0,    text: '$ raptor evaluate "MyP@ssw0rd"',     color: 'green'  },
  { delay: 800,  text: '  Entropy          →  42.3 bits',     color: 'dim'    },
  { delay: 1200, text: '  Strength         →  Fair',          color: 'warn'   },
  { delay: 1600, text: '  Crack (offline)  →  3 hours',       color: 'warn'   },
  { delay: 2100, text: '  Keyboard pattern →  detected',      color: 'danger' },
  { delay: 2600, text: '  Suggestion       →  add length',    color: 'dim'    },
  { delay: 3200, text: '',                                     color: 'dim'    },
  { delay: 3300, text: '$ raptor generate --length 20 --all', color: 'green'  },
  { delay: 4100, text: '  $Kz9#mLqR2@vN!pXj7&',             color: 'bright' },
  { delay: 4600, text: '  Entropy          →  131.4 bits',    color: 'dim'    },
  { delay: 5000, text: '  Strength         →  Very Strong ✓', color: 'safe'   },
];

// Fix #21 — isMounted ref prevents setState after unmount
function TerminalLines() {
  const [shown, setShown]       = useState(0);
  const isMountedRef            = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const timers = LINES.map(({ delay }, i) =>
      setTimeout(() => {
        if (isMountedRef.current) {
          setShown(s => Math.max(s, i + 1));
        }
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      {LINES.slice(0, shown).map((line, i) => (
        <div key={i} className={`home__terminal-line home__terminal-line--${line.color}`}>
          {line.text}
        </div>
      ))}
      {shown < LINES.length && <span className="home__terminal-cursor">█</span>}
    </>
  );
}
