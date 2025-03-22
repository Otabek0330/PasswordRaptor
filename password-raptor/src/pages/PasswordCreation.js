import React, { useState, useEffect } from "react";
import "./PasswordCreation.css";
import Button from "../components/Button";
import refreshImg from "../assets/images/refresh.png";
import copyImg from "../assets/images/copy.png";
import tickImg from "../assets/images/tick.png";

const PasswordCreation = () => {
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [passwordLength, setPasswordLength] = useState(12);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copyIcon, setCopyIcon] = useState(copyImg);
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generatePassword = () => {
    let characterPool = "";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%&*()_+[]{};.?";

    if (includeUppercase) characterPool += uppercase;
    if (includeLowercase) characterPool += lowercase;
    if (includeNumbers) characterPool += numbers;
    if (includeSymbols) characterPool += symbols;

    if (characterPool.length === 0) return "Select at least one option";

    let password = "";
    for (let i = 0; i < passwordLength; i++) {
      password += characterPool[Math.floor(Math.random() * characterPool.length)];
    }
    return password;
  };

  useEffect(() => {
    setGeneratedPassword(generatePassword());
  }, [includeUppercase, includeLowercase, includeNumbers, includeSymbols, passwordLength]);

  const refreshPassword = () => {
    setIsRefreshing(true);
    const characterPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    const interval = setInterval(() => {
      let shufflingPassword = "";
      for (let i = 0; i < passwordLength; i++) {
        shufflingPassword += characterPool[Math.floor(Math.random() * characterPool.length)];
      }
      setGeneratedPassword(shufflingPassword);
    }, 25);

    setTimeout(() => {
      clearInterval(interval);
      setGeneratedPassword(generatePassword());
      setIsRefreshing(false);
    }, 500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopyIcon(tickImg);
    setIsCopied(true);
    setTimeout(() => {
      setCopyIcon(copyImg);
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="password-creation-container">
      <h2>Random Password Creation</h2>
      <div className="password-display">
        <p className={isRefreshing ? "shuffling" : ""}>{generatedPassword}</p>
        <div className="password-actions">
          <Button
            onClick={refreshPassword}
            imgSrc={refreshImg}
            imgAlt="Refresh Icon"
            disabled={isRefreshing}
          >
            Refresh
          </Button>
          <Button
            onClick={copyToClipboard}
            imgSrc={copyIcon}
            imgAlt="Copy Icon"
            disabled={isCopied}
          >
            {isCopied ? "COPIED" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="controls">
        <div className="toggle">
          <label>
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={() => setIncludeUppercase(!includeUppercase)}
            />
            Include Uppercase Letters
          </label>
        </div>

        <div className="toggle">
          <label>
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={() => setIncludeLowercase(!includeLowercase)}
            />
            Include Lowercase Letters
          </label>
        </div>

        <div className="toggle">
          <label>
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={() => setIncludeNumbers(!includeNumbers)}
            />
            Include Numbers
          </label>
        </div>

        <div className="toggle">
          <label>
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={() => setIncludeSymbols(!includeSymbols)}
            />
            Include Symbols
          </label>
        </div>
        <div className="slider">
          <label>Password Length: {passwordLength}</label>
          <input
            type="range"
            min="6"
            max="28"
            value={passwordLength}
            onChange={(e) => setPasswordLength(+e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PasswordCreation;
