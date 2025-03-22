import React, { useState } from "react";
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

  const evaluatePassword = (inputPassword) => {
    if (!inputPassword) {
      setEvaluation(null);
      return;
    }

    const result = zxcvbn(inputPassword);
    const score = result.score;
    const strengthPercentage = (score + 1) * 20;

    let userLevel = "";
    let color = "";
    let img = null;
    let explanation = "";

    switch (score) {
      case 0:
        userLevel = "You are a Password Beginner";
        color = "red";
        img = veryWeakImg;
        explanation = "This is like leaving your door wide open with a welcome sign. Anyone can pay a visit.";
        break;
      case 1:
        userLevel = "You are a Password Novice";
        color = "#f05151";
        img = weakImg;
        explanation = "This is like leaving your wide door open. Better fix this.";
        break;
      case 2:
        userLevel = "You are a Password Explorer";
        color = "yellow";
        img = moderateImg;
        explanation = "This is like locking your door with a keypad, but leaving the code nearby.";
        break;
      case 3:
        userLevel = "You are a Password Expert";
        color = "#297bff";
        img = strongImg;
        explanation = "This is like locking your door with both a keypad and a regular lock.";
        break;
      case 4:
        userLevel = "You are a Password Master";
        color = "blue";
        img = veryStrongImg;
        explanation =
          "This is like securing your door with a keypad, a lock, an NFC reader, and a surveillance camera.";
        break;
      default:
        break;
    }

    setEvaluation({
      score,
      strengthPercentage,
      feedback: result.feedback?.suggestions || [],
      image: img,
      color,
      userLevel,
      strengthLabel: ["Very Weak", "Weak", "Moderate", "Strong", "Very Strong"][score],
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
                  className="strength-bar"
                  style={{
                    width: `${evaluation.strengthPercentage}%`,
                    backgroundColor: evaluation.color,
                  }}
                ></div>
              </div>
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
                <li>Your password is secure.</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default PasswordEvaluation;