import React from "react";
import "./Button.css";

const Button = ({ children, href, onClick, imgSrc, imgAlt, disabled }) => (
  <a
    href={href || "#"}
    onClick={(e) => {
      e.preventDefault();
      if (!disabled && onClick) onClick(); // Call onClick only if not disabled
    }}
    className={`button animated-button ${disabled ? "disabled" : ""}`} // Add "disabled" class when disabled
    style={{ pointerEvents: disabled ? "none" : "auto" }} // Prevent interaction if disabled
  >
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    {imgSrc && <img src={imgSrc} alt={imgAlt} />}
    {children}
  </a>
);

export default Button;
