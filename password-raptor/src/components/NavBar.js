import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";
import logoImg from "../assets/images/logo_white.png";
import burgerImg from "../assets/images/burger.png";
import wrongImg from "../assets/images/wrong.png";

const NavBar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="topnav">
      <div className="logo">
        <Link to="/">
          <img src={logoImg} alt="Logo" />
        </Link>

        <button className="burger-icon" onClick={toggleMenu}>
          <img src={menuOpen ? wrongImg : burgerImg} alt="Menu" />
        </button>
      </div>

      <div className={`nav-links ${menuOpen ? "show" : ""}`}>
        <Link to="/" className={location.pathname === "/" ? "active" : ""} onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link to="/evaluate" className={location.pathname === "/evaluate" ? "active" : ""} onClick={() => setMenuOpen(false)}>
          Password Evaluation
        </Link>
        <Link to="/create" className={location.pathname === "/create" ? "active" : ""} onClick={() => setMenuOpen(false)}>
          Random Generation
        </Link>
        <Link to="/personalized" className={location.pathname === "/personalized" ? "active" : ""} onClick={() => setMenuOpen(false)}>
          Personalized Generation
        </Link>
        <Link to="/breached" className={location.pathname === "/breached" ? "active" : ""} onClick={() => setMenuOpen(false)}>
          Check Breached Password
        </Link>
        <Link to="/quiz" className={location.pathname === "/quiz" ? "active" : ""} onClick={() => setMenuOpen(false)}>
          Password Generation Quiz
        </Link>
        <Link to="/about" className={location.pathname === "/about" ? "active" : ""} onClick={() => setMenuOpen(false)}>
          About
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
