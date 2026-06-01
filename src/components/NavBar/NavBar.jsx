import React, { useState, useEffect } from 'react';
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

export default function NavBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} aria-label="Main navigation">
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

      <div
        id="mobile-menu"
        className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul role="list">
          {NAV_LINKS.map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={`navbar__mobile-link ${location.pathname === path ? 'navbar__mobile-link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {menuOpen && (
        <div className="navbar__overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}
