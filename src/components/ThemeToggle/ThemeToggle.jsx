import React, { useRef } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const btnRef = useRef(null);

  const handleClick = () => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.classList.remove('theme-toggle--burst');
    void btn.offsetWidth;
    btn.classList.add('theme-toggle--burst');
    toggle();
  };

  return (
    <button
      ref={btnRef}
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'}`}
      onClick={handleClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__stars">
          <span className="theme-toggle__star theme-toggle__star--1" />
          <span className="theme-toggle__star theme-toggle__star--2" />
          <span className="theme-toggle__star theme-toggle__star--3" />
        </span>
        <span className="theme-toggle__clouds">
          <span className="theme-toggle__cloud theme-toggle__cloud--1" />
          <span className="theme-toggle__cloud theme-toggle__cloud--2" />
        </span>
      </span>

      <span className="theme-toggle__orb" aria-hidden="true">
        <span className="theme-toggle__crater theme-toggle__crater--1" />
        <span className="theme-toggle__crater theme-toggle__crater--2" />
      </span>

      <span className="theme-toggle__burst-ring" aria-hidden="true" />
    </button>
  );
}
