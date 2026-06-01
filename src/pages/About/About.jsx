import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Zap, Lock, Globe, Mail, X, Check } from 'lucide-react';
import './About.css';

const FAQS = [
  {
    q: 'Does Password Raptor store my passwords?',
    a: 'No. Every operation — generation, evaluation, and strength analysis — runs entirely in your browser using JavaScript. Nothing is ever sent to our servers. We have no servers to receive it.',
  },
  {
    q: 'How does the breach check work without exposing my password?',
    a: 'We use the k-Anonymity model pioneered by Troy Hunt (HaveIBeenPwned). Your password is hashed with SHA-1 locally. Only the first 5 characters of that hash are sent to the API. The API returns hundreds of matching hash suffixes, and we match locally — your full hash never leaves your device.',
  },
  {
    q: 'What makes a password truly strong?',
    a: 'Length is the single biggest factor — every extra character multiplies the search space exponentially. Beyond length: character variety (upper, lower, digits, symbols), true randomness (no patterns or dictionary words), and uniqueness (never reused across sites).',
  },
  {
    q: 'What is entropy and why does it matter?',
    a: 'Entropy (measured in bits) represents the unpredictability of a password. 1 bit of entropy doubles the number of guesses an attacker must make. A password with 80 bits of entropy requires 2^80 guesses — far beyond any brute-force capability today.',
  },
  {
    q: 'How is crack time calculated?',
    a: 'We calculate the total combinations (2^entropy), then divide by the attack rate for three realistic scenarios: online attacks (~10/sec), offline attacks on secure hashes like bcrypt (~10,000/sec), and GPU-based attacks on weak hashes like MD5 (~10 billion/sec).',
  },
  {
    q: 'Are passphrases secure?',
    a: 'Yes — extremely so when using 4+ random words. A 4-word passphrase from a 256-word list has ~32 bits of entropy. With 5+ words from a larger list you reach 60+ bits, which is very strong. Passphrases are also far easier to memorise than random character strings.',
  },
  {
    q: 'Should I use different passwords on every site?',
    a: 'Absolutely. When one site is breached, attackers immediately try those credentials everywhere else (credential stuffing). Using unique passwords means a breach on one site cannot cascade to others. A password manager makes this practical.',
  },
  {
    q: 'What does the Memorable Password mode do?',
    a: 'It takes a sentence you provide, extracts the first letter of each word, then applies transformations: mixed capitalisation, injected numbers, and symbols. The result is a short, cryptic-looking password that only you can reconstruct from the original sentence.',
  },
  {
    q: 'What is the email breach check doing?',
    a: 'Email lookups query the HaveIBeenPwned database to identify which known data breaches involved your email address. This requires a paid HIBP API key for direct lookup. If unavailable, we display the full public breach database so you can cross-reference services you\'ve used.',
  },
  {
    q: 'Is Password Raptor free?',
    a: 'Yes, completely free. No account, no registration, no tracking, no ads.',
  },
];

const MYTHS = [
  {
    myth: 'Changing O→0 and a→@ adds real security',
    reality: 'Modern cracking tools apply every common substitution pattern automatically. "P@ssw0rd" is just as weak as "Password" — crackers try these variants first.',
    icon: '🔡',
  },
  {
    myth: 'Short complex passwords beat long simple ones',
    reality: '"P@5!" has ~26 bits of entropy. "correct-horse-battery" has ~55 bits. Length wins every time — the maths is unambiguous.',
    icon: '📏',
  },
  {
    myth: 'You should change passwords every 30–90 days',
    reality: 'NIST (2020) explicitly reversed this advice. Forced rotation leads to weak incremental changes (Password1 → Password2). Only change passwords when there\'s evidence of compromise.',
    icon: '🔄',
  },
  {
    myth: 'Password managers are risky — one breach and everything\'s gone',
    reality: 'The alternative — reusing one memorable password — is far riskier. Password managers encrypt vaults locally before syncing. A single strong master password protects hundreds of unique passwords.',
    icon: '🔐',
  },
  {
    myth: 'My account has 2FA so the password doesn\'t matter',
    reality: '2FA helps enormously but doesn\'t make passwords irrelevant. Phishing bypasses 2FA. Credential stuffing uses leaked passwords to target accounts. Weak passwords also risk account takeover if 2FA is ever disabled or unavailable.',
    icon: '📱',
  },
  {
    myth: 'Long passwords are hard to remember',
    reality: '"I drank coffee at the old blue café" → "IDcatObc!" — easy to reconstruct, hard to crack. Or use a 4-word passphrase: "coral-drift-maple-frost" takes centuries to brute-force and is perfectly memorable.',
    icon: '🧠',
  },
];

const PRINCIPLES = [
  { icon: Lock,        title: 'Local-First',    desc: 'All computation runs in your browser. Your passwords are never transmitted.' },
  { icon: ShieldCheck, title: 'k-Anonymity',    desc: 'Breach checks use k-anonymity — only hash prefixes are shared, never your full password.' },
  { icon: Zap,         title: 'Entropy-Based',  desc: 'Strength evaluation uses information theory — entropy bits, not just character rules.' },
  { icon: Globe,       title: 'No Tracking',    desc: 'No analytics, no cookies, no telemetry. Zero data collection of any kind.' },
];

export default function About() {
  const [openFaq, setOpenFaq]   = useState(null);
  const [openMyth, setOpenMyth] = useState(null);

  useEffect(() => {
    document.title = 'Password Raptor | About';
  }, []);

  return (
    <div className="about">

      {/* ── Intro ── */}
      <section className="about__intro">
        <h1>About Password Raptor</h1>
        <p>
          Password Raptor is a privacy-first password toolkit. Every tool runs locally in your browser —
          no servers, no databases, no way to see your passwords even if we wanted to.
        </p>
        <p>
          Built with a focus on cryptographic correctness, honest strength evaluation, and a
          clean interface that doesn't get in the way.
        </p>
      </section>

      {/* ── Principles ── */}
      <section className="about__section">
        <h2 className="about__section-title">Core Principles</h2>
        <div className="about__principles-grid">
          {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="about__principle">
              <div className="about__principle-icon"><Icon size={20} strokeWidth={1.75} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Myths ── */}
      <section className="about__section">
        <div className="about__section-header">
          <h2 className="about__section-title">Password Myths — Debunked</h2>
          <p className="about__section-sub">Common beliefs that make passwords weaker, not stronger.</p>
        </div>
        <div className="about__myths-grid">
          {MYTHS.map((item, i) => (
            <div
              key={i}
              className={`about__myth-card ${openMyth === i ? 'about__myth-card--open' : ''}`}
              onClick={() => setOpenMyth(openMyth === i ? null : i)}
            >
              <div className="about__myth-header">
                <span className="about__myth-emoji">{item.icon}</span>
                <div className="about__myth-content">
                  <div className="about__myth-label">
                    <span className="about__myth-tag about__myth-tag--myth"><X size={10} /> Myth</span>
                    <span className="about__myth-text">"{item.myth}"</span>
                  </div>
                  {openMyth === i && (
                    <div className="about__myth-reality">
                      <span className="about__myth-tag about__myth-tag--reality"><Check size={10} /> Reality</span>
                      <p>{item.reality}</p>
                    </div>
                  )}
                </div>
                <span className="about__myth-chevron">
                  {openMyth === i ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="about__section">
        <div className="about__section-header">
          <h2 className="about__section-title">Frequently Asked Questions</h2>
          <p className="about__section-sub">Security questions, answered honestly.</p>
        </div>
        <div className="about__faq-list">
          {FAQS.map((item, i) => (
            <div key={i} className={`about__faq-item ${openFaq === i ? 'about__faq-item--open' : ''}`}>
              <button className="about__faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{item.q}</span>
                {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === i && (
                <div className="about__faq-a">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="about__contact">
        <div className="about__contact-inner">
          <Mail size={18} />
          <div>
            <strong>Get in touch</strong>
            <p>Questions, feedback, or security concerns?</p>
            <a href="mailto:passwordraptor@gmail.com" className="about__email">
              passwordraptor@gmail.com
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
