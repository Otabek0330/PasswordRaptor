import React, { useState, useEffect } from "react";
import "./PasswordCreation.css";
import Button from "../components/Button";
import refreshImg from "../assets/images/refresh.png";
import copyImg from "../assets/images/copy.png";
import tickImg from "../assets/images/tick.png";

const PasswordCreation = () => {
  // Random Password States
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [passwordLength, setPasswordLength] = useState(12);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copyIcon, setCopyIcon] = useState(copyImg);
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Passphrase States
  const [dictionaryWords, setDictionaryWords] = useState([]);
  const [passphrase, setPassphrase] = useState("");
  const [passphraseLength, setPassphraseLength] = useState(4);
  const [passphraseCopyIcon, setPassphraseCopyIcon] = useState(copyImg);
  const [isPassphraseCopied, setIsPassphraseCopied] = useState(false);
  const [isPassphraseRefreshing, setIsPassphraseRefreshing] = useState(false);
  const [ppUppercase, setPpUppercase] = useState(false);
  const [ppLowercase, setPpLowercase] = useState(true);
  const [ppNumbers, setPpNumbers] = useState(false);
  const [ppSymbols, setPpSymbols] = useState(false);

  useEffect(() => {
    document.title = "Password Raptor | Generate Random Password";
  }, []);

  useEffect(() => {
    fetch("/dictionary.txt")
      .then((res) => res.text())
      .then((text) => {
        const words = text
          .split("\n")
          .map((w) => w.trim())
          .filter((w) => /^[a-zA-Z]+$/.test(w));
        setDictionaryWords(words);
      })
      .catch((err) => console.error("Failed to load dictionary:", err));
  }, []);

  useEffect(() => {
    if (dictionaryWords.length > 0) generatePassphrase(false);
  }, [dictionaryWords, passphraseLength, ppUppercase, ppLowercase, ppNumbers, ppSymbols]);

  useEffect(() => {
    setGeneratedPassword(generatePassword());
  }, [includeUppercase, includeLowercase, includeNumbers, includeSymbols, passwordLength]);

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

  const capitalizeRandomLetters = (word) => {
    return word
      .split("")
      .map((char) => (Math.random() < 0.4 ? char.toUpperCase() : char))
      .join("");
  };

  const injectNumbers = (word) => {
    const randomDigit = Math.floor(Math.random() * 10);
    const pos = Math.floor(Math.random() * (word.length + 1));
    return word.slice(0, pos) + randomDigit + word.slice(pos);
  };

  const injectSymbols = (word) => {
    const symbols = "!@#$%^&*";
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    return Math.random() < 0.5 ? symbol + word : word + symbol;
  };

  const generateRawPassphrase = () => {
    const selected = [];
    for (let i = 0; i < passphraseLength; i++) {
      let word = dictionaryWords[Math.floor(Math.random() * dictionaryWords.length)];

      if (ppLowercase && !ppUppercase) word = word.toLowerCase();
      if (!ppLowercase && ppUppercase) word = word.toUpperCase();
      if (ppUppercase && ppLowercase) word = capitalizeRandomLetters(word);
      if (ppNumbers) word = injectNumbers(word);
      if (ppSymbols) word = injectSymbols(word);

      selected.push(word);
    }
    return selected.join("-");
  };

  const generatePassphrase = (withShuffle = false) => {
    if (dictionaryWords.length === 0) {
      setPassphrase("Loading word list...");
      return;
    }

    if (withShuffle) {
      setIsPassphraseRefreshing(true);
      const characterPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      const interval = setInterval(() => {
        let temp = "";
        for (let i = 0; i < passphraseLength * 4; i++) {
          temp += characterPool[Math.floor(Math.random() * characterPool.length)];
        }
        setPassphrase(temp);
      }, 25);

      setTimeout(() => {
        clearInterval(interval);
        setPassphrase(generateRawPassphrase());
        setIsPassphraseRefreshing(false);
      }, 500);
    } else {
      setPassphrase(generateRawPassphrase());
    }
  };

  const copyPassphrase = () => {
    navigator.clipboard.writeText(passphrase);
    setPassphraseCopyIcon(tickImg);
    setIsPassphraseCopied(true);
    setTimeout(() => {
      setPassphraseCopyIcon(copyImg);
      setIsPassphraseCopied(false);
    }, 2000);
  };

  return (
    <div className="password-creation-container">
      {/* Random Password Section */}
      <div className="section-wrapper">
        <h2>Random Password Creation</h2>
        <div className="password-display">
          <p className={isRefreshing ? "shuffling" : ""}>{generatedPassword}</p>
          <div className="password-actions">
            <Button onClick={refreshPassword} imgSrc={refreshImg} disabled={isRefreshing}>
              Refresh
            </Button>
            <Button onClick={copyToClipboard} imgSrc={copyIcon} disabled={isCopied}>
              {isCopied ? "COPIED" : "Copy"}
            </Button>
          </div>
        </div>

        <div className="controls">
          <div className="toggle">
            <label>
              <input type="checkbox" checked={includeUppercase} onChange={() => setIncludeUppercase(!includeUppercase)} />
              Include Uppercase Letters
            </label>
          </div>
          <div className="toggle">
            <label>
              <input type="checkbox" checked={includeLowercase} onChange={() => setIncludeLowercase(!includeLowercase)} />
              Include Lowercase Letters
            </label>
          </div>
          <div className="toggle">
            <label>
              <input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} />
              Include Numbers
            </label>
          </div>
          <div className="toggle">
            <label>
              <input type="checkbox" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} />
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

      {/* Passphrase Generator Section */}
      <div className="section-wrapper">
        <h2>Passphrase Generator</h2>
        <div className="password-display">
          <p className={isPassphraseRefreshing ? "shuffling" : ""}>{passphrase}</p>
          <div className="password-actions">
            <Button onClick={() => generatePassphrase(true)} imgSrc={refreshImg} disabled={isPassphraseRefreshing}>
              Refresh
            </Button>
            <Button onClick={copyPassphrase} imgSrc={passphraseCopyIcon} disabled={isPassphraseCopied}>
              {isPassphraseCopied ? "COPIED" : "Copy"}
            </Button>
          </div>
        </div>

        <div className="controls">
          <div className="toggle">
            <label>
              <input type="checkbox" checked={ppUppercase} onChange={() => setPpUppercase(!ppUppercase)} />
              Include Uppercase Letters
            </label>
          </div>
          <div className="toggle">
            <label>
              <input type="checkbox" checked={ppLowercase} onChange={() => setPpLowercase(!ppLowercase)} />
              Include Lowercase Letters
            </label>
          </div>
          <div className="toggle">
            <label>
              <input type="checkbox" checked={ppNumbers} onChange={() => setPpNumbers(!ppNumbers)} />
              Include Numbers
            </label>
          </div>
          <div className="toggle">
            <label>
              <input type="checkbox" checked={ppSymbols} onChange={() => setPpSymbols(!ppSymbols)} />
              Include Symbols
            </label>
          </div>
          <div className="slider">
            <label>Number of Words: {passphraseLength}</label>
            <input
              type="range"
              min="3"
              max="10"
              value={passphraseLength}
              onChange={(e) => setPassphraseLength(+e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordCreation;
