import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx';
import './NavBar.css';

const NAV_LINKS = [
  { path: '/',          label: 'Home'         },
  { path: '/create',    label: 'Create'       },
  { path: '/evaluate',  label: 'Evaluate'     },
  { path: '/compare',   label: 'Compare'      },
  { path: '/breach',    label: 'Breach Check' },
  { path: '/about',     label: 'About'        },
];

// Fix #18 — all focusable element selectors
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export default function NavBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const burgerRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Fix #18 — focus trap inside mobile menu
  const handleMenuKeyDown = useCallback((e) => {
    if (!menuOpen) return;

    // Escape closes the menu and returns focus to burger
    if (e.key === 'Escape') {
      setMenuOpen(false);
      burgerRef.current?.focus();
      return;
    }

    // Tab / Shift+Tab cycle only within the menu
    if (e.key === 'Tab') {
      const menu = mobileMenuRef.current;
      if (!menu) return;

      const focusable = Array.from(menu.querySelectorAll(FOCUSABLE));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, [menuOpen]);

  // Move focus into menu when it opens
  useEffect(() => {
    if (menuOpen && mobileMenuRef.current) {
      const focusable = mobileMenuRef.current.querySelectorAll(FOCUSABLE);
      if (focusable.length > 0) {
        // Small delay so the menu transition completes
        setTimeout(() => focusable[0].focus(), 50);
      }
    }
  }, [menuOpen]);

  return (
    <>
      <nav
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
        aria-label="Main navigation"
        onKeyDown={handleMenuKeyDown}
      >
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo" aria-label="Password Raptor — Home">
            <img src="/favicon.ico" alt="Password Raptor" className="navbar__logo-img" />
          </Link>

          <ul className="navbar__links" role="list">
            {NAV_LINKS.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`navbar__link ${location.pathname === path ? 'navbar__link--active' : ''}`}
                >
                  {label}
                  <span className="navbar__link-dot" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar__right">
            <ThemeToggle />
            <button
              ref={burgerRef}
              className="navbar__burger"
              onClick={() => setMenuOpen(v => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Fix #18 — mobile menu with ref for focus trap */}
      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
      >
        <ul role="list">
          {NAV_LINKS.map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={`navbar__mobile-link ${location.pathname === path ? 'navbar__mobile-link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
                tabIndex={menuOpen ? 0 : -1}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {menuOpen && (
        <div
          className="navbar__overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
