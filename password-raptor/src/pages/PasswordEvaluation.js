import React, { useState, useEffect } from 'react';
import "./PasswordEvaluation.css";
import Button from "../components/Button";
import zxcvbn from "zxcvbn";
import tickImg from "../assets/images/tick.png";
import wrongImg from "../assets/images/wrong.png";
import veryWeakImg from "../assets/images/very_weak.png";
import weakImg from "../assets/images/weak.png";
import moderateImg from "../assets/images/moderate.png";
import strongImg from "../assets/images/strong.png";
import veryStrongImg from "../assets/images/very_strong.png";

const PasswordEvaluation = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    document.title = "Password Raptor | Evaluate Password";
  }, []);

  const formatCrackTime = (seconds) => {
    if (seconds < 60) return `${Math.floor(seconds)} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months`;
    if (seconds < 3153600000) return `${Math.floor(seconds / 31536000)} years`;
    return "centuries";
  };

  const evaluatePassword = (inputPassword) => {
    if (!inputPassword) {
      setEvaluation(null);
      return;
    }

    const result = zxcvbn(inputPassword);
    const crackTime = result.crack_times_seconds.offline_slow_hashing_1e4_per_second;
    const feedback = [];
    let userLevel = "";
    let strengthLabel = "";
    let color = "grey";
    let img = null;
    let explanation = "";

    let strengthPercentage = Math.min((Math.log10(crackTime + 1) / 15) * 100, 100);
    strengthPercentage = Math.max(strengthPercentage, 5);

    if (crackTime < 1e4) {
      userLevel = "You are a Password Beginner";
      strengthLabel = "Very Weak";
      color = "#ff4d4f";
      img = veryWeakImg;
      feedback.push("❌ Your password is extremely weak. Add more characters and mix cases, symbols, and numbers.");
      explanation = "This is like leaving your door wide open with a welcome sign.";
    } else if (crackTime < 1e6) {
      userLevel = "You are a Password Novice";
      strengthLabel = "Weak";
      color = "#ff944d";
      img = weakImg;
      feedback.push("⚠️ This password is weak. Try adding uncommon words or symbols.");
      explanation = "This is like leaving your door unlocked. Better fix this.";
    } else if (crackTime < 1e8) {
      userLevel = "You are a Password Explorer";
      strengthLabel = "Moderate";
      color = "#ffc107";
      img = moderateImg;
      feedback.push("🟡 Your password is moderately strong, but could still be improved.");
      explanation = "This is like locking your door with a keypad, but leaving the code nearby.";
    } else if (crackTime < 1e12) {
      userLevel = "You are a Password Expert";
      strengthLabel = "Strong";
      color = "#3399ff";
      img = strongImg;
      feedback.push("✅ Your password is strong, but it can be improved a little more.");
      explanation = "This is like locking your door with both a keypad and a regular lock.";
    } else {
      userLevel = "You are a Password Master";
      strengthLabel = "Very Strong";
      color = "#0066cc";
      img = veryStrongImg;
      feedback.push("🛡️ Your password is extremely strong. Well done!");
      explanation = "This is like securing your door with a keypad, a lock, an NFC reader, and a surveillance camera.";
    }

    setEvaluation({
      crackTimeSeconds: crackTime,
      strengthPercentage,
      feedback,
      image: img,
      color,
      userLevel,
      strengthLabel,
      explanation,
      inclusions: {
        isLongEnough: inputPassword.length >= 12,
        hasLowercase: /[a-z]/.test(inputPassword),
        hasUppercase: /[A-Z]/.test(inputPassword),
        hasSymbols: /[!@#$%^&*(),.?":{}|<>]/.test(inputPassword),
        hasNumbers: /\d/.test(inputPassword),
      },
    });
  };

  return (
    <div className="password-evaluation-container">
      <h2>Password Evaluation</h2>
      <p className="about-text">
        Visit the <a href="/about" className="about-link">About</a> page to learn tips on creating strong passwords.
      </p>

      <div className="password-input-wrapper">
        <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="password-input">
          <input
            type="text"
            name="fake-password-checker"
            inputMode="text"
            autoComplete="off"
            value={password}
            onChange={(e) => {
              const inputPassword = e.target.value;
              setPassword(inputPassword);
              evaluatePassword(inputPassword);
            }}
            placeholder="Enter your password"
            maxLength={50}
            style={{ WebkitTextSecurity: showPassword ? "none" : "disc" }}
          />
          <Button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </Button>
        </form>
      </div>

      {evaluation && (
        <>
          <div className="strength-section">
            <h3 style={{ color: evaluation.color }}>{evaluation.userLevel}</h3>
            <div className="strength-slider-container">
              <p style={{ color: evaluation.color }}>{evaluation.strengthLabel}</p>
              <div className="strength-slider">
                <div
                  className={`strength-bar ${evaluation.strengthPercentage >= 99 ? "glow" : ""}`}
                  style={{
                    width: `${evaluation.strengthPercentage}%`,
                    backgroundColor:
                      evaluation.strengthPercentage >= 99 ? "#00bfff" : evaluation.color,
                  }}
                ></div>
              </div>
              <p className="crack-time" style={{ color: evaluation.color }}>
                Crack Time: {formatCrackTime(evaluation.crackTimeSeconds)}
              </p>
            </div>
          </div>

          <div className="password-evaluation-content">
            <div className="evaluation-left">
              {evaluation.image && <img src={evaluation.image} alt="Door State" />}
            </div>
            <div className="evaluation-right">
              <h3>Inclusions</h3>
              <ul className="inclusions-list">
                <li className={evaluation.inclusions.isLongEnough ? "included" : "not-included"}>
                  <img src={evaluation.inclusions.isLongEnough ? tickImg : wrongImg} alt="Status" />
                  At least 12 characters
                </li>
                <li className={evaluation.inclusions.hasLowercase ? "included" : "not-included"}>
                  <img src={evaluation.inclusions.hasLowercase ? tickImg : wrongImg} alt="Status" />
                  Lowercase
                </li>
                <li className={evaluation.inclusions.hasUppercase ? "included" : "not-included"}>
                  <img src={evaluation.inclusions.hasUppercase ? tickImg : wrongImg} alt="Status" />
                  Uppercase
                </li>
                <li className={evaluation.inclusions.hasSymbols ? "included" : "not-included"}>
                  <img src={evaluation.inclusions.hasSymbols ? tickImg : wrongImg} alt="Status" />
                  Symbols (?#@ etc.)
                </li>
                <li className={evaluation.inclusions.hasNumbers ? "included" : "not-included"}>
                  <img src={evaluation.inclusions.hasNumbers ? tickImg : wrongImg} alt="Status" />
                  Numbers
                </li>
              </ul>
            </div>
          </div>

          <div className="feedback-explanation">
            <p>{evaluation.explanation}</p>
            <ul>
              {evaluation.feedback.length > 0 ? (
                evaluation.feedback.map((msg, idx) => <li key={idx}>{msg}</li>)
              ) : (
                <li>No suggestions available.</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default PasswordEvaluation;
