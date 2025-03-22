import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";
import logoImg from "../assets/images/logo_white.png";

const NavBar = () => {
  const location = useLocation(); // Get the current path

  return (
    <nav className="topnav">
      <div className="logo">
        <Link to="/">
          <img src={logoImg} alt="Logo" />
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Home
        </Link>
        <Link to="/evaluate" className={location.pathname === "/evaluate" ? "active" : ""}>
          Password Evaluation
        </Link>
        <Link to="/create" className={location.pathname === "/create" ? "active" : ""}>
          Random Generation
        </Link>
        <Link to="/personalized" className={location.pathname === "/personalized" ? "active" : ""}>
          Personalized Generation
        </Link>
        <Link to="/breached" className={location.pathname === "/breached" ? "active" : ""}>
          Check Breached Password
        </Link>
        <Link to="/quiz" className={location.pathname === "/quiz" ? "active" : ""}>
          Password Generation Quiz
        </Link>
        <Link to="/about" className={location.pathname === "/about" ? "active" : ""}>
          About
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
