import React, { useState, useEffect } from 'react';
import zxcvbn from 'zxcvbn';
import './PersonalizedPassword.css';
import Button from '../components/Button';
import wrongImg from '../assets/images/wrong.png';
import copyImg from '../assets/images/copy.png';
import tickImg from '../assets/images/tick.png';
import refreshImg from '../assets/images/refresh.png';

const PersonalizedPassword = () => {
    const [words, setWords] = useState([]);
    const [newWord, setNewWord] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [strengthLabel, setStrengthLabel] = useState('');
    const [strengthColor, setStrengthColor] = useState('gray');
    const [passwordLength, setPasswordLength] = useState(12);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [copyIcon, setCopyIcon] = useState(copyImg);
    const [isCopied, setIsCopied] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);

    useEffect(() => {
        document.title = "Password Raptor | Generate Personalized Password";
    }, []);

    const evaluateStrength = (password) => {
        const result = zxcvbn(password);
        const crackTime = result.crack_times_seconds.offline_slow_hashing_1e4_per_second;

        if (crackTime < 1e4) {
            setStrengthLabel("Very Weak");
            setStrengthColor("#ff4d4f");
        } else if (crackTime < 1e6) {
            setStrengthLabel("Weak");
            setStrengthColor("#ff944d");
        } else if (crackTime < 1e8) {
            setStrengthLabel("Moderate");
            setStrengthColor("#ffc107");
        } else if (crackTime < 1e12) {
            setStrengthLabel("Strong");
            setStrengthColor("#3399ff");
        } else {
            setStrengthLabel("Very Strong");
            setStrengthColor("#0066cc");
        }
    };

    const addWord = () => {
        if (words.length < 7 && newWord.trim().length >= 3 && newWord.length <= 14) {
            setWords([...words, newWord.trim()]);
            setNewWord('');
            setHasGenerated(false);
        }
    };

    const removeWord = (index) => {
        setWords(words.filter((_, i) => i !== index));
        setHasGenerated(false);
    };

    const generatePasswordHandler = () => {
        if (words.length < 3) {
            setGeneratedPassword("Please enter at least 3 words.");
            setStrengthLabel('');
            return;
        }

        const shuffled = [...words].sort(() => 0.5 - Math.random());
        const count = Math.floor(Math.random() * (Math.min(10, shuffled.length) - 3 + 1)) + 3;
        const selected = shuffled.slice(0, count);

        let password = selected.map(word => {
            if (word.length > 4 && Math.random() < 0.3) {
                const split = Math.floor(word.length / 2);
                const insert = Math.random() < 0.5
                    ? Math.floor(Math.random() * 10)
                    : "!@#$%^&*()"[Math.floor(Math.random() * 10)];
                return word.slice(0, split) + insert + word.slice(split);
            }
            return word;
        }).join(() => (Math.random() < 0.3 ? "!@#$%^&*()"[Math.floor(Math.random() * 10)] : "-"));

        if (Math.random() < 0.5) {
            password = password.toUpperCase();
        } else if (Math.random() < 0.75) {
            password = password.toLowerCase();
        } else {
            password = password.charAt(0).toUpperCase() + password.slice(1);
        }

        if (password.length < passwordLength) {
            const diff = passwordLength - password.length;
            const pool = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            for (let i = 0; i < diff; i++) {
                password += pool[Math.floor(Math.random() * pool.length)];
            }
        } else {
            password = password.slice(0, passwordLength);
        }

        setGeneratedPassword(password);
        evaluateStrength(password);
        setHasGenerated(true);
    };

    const shufflePassword = () => {
        if (!generatedPassword) return;
        setIsShuffling(true);

        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        const interval = setInterval(() => {
            let temp = "";
            for (let i = 0; i < passwordLength; i++) {
                temp += chars[Math.floor(Math.random() * chars.length)];
            }
            setGeneratedPassword(temp);
        }, 25);

        setTimeout(() => {
            clearInterval(interval);
            setIsShuffling(false);
            generatePasswordHandler();
        }, 500);
    };

    useEffect(() => {
        if (hasGenerated) generatePasswordHandler();
    }, [passwordLength]);

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
        <div className="personalized-password-container">
            <h2>Personalized Password Creation</h2>
            <p className="instructions">Input 3–7 words (min. 3 letters each) to generate a strong password.</p>

            <div className="input-and-buttons">
                <input
                    type="text"
                    maxLength={14}
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Enter a word"
                    className="word-input"
                />
                <Button onClick={addWord} disabled={words.length >= 7 || newWord.trim().length < 3}>Add</Button>
            </div>

            <div className="word-list">
                {words.map((word, index) => (
                    <div key={index} className="word-item">
                        {word}
                        <button onClick={() => removeWord(index)} className="remove-button">
                            <img src={wrongImg} alt="Remove" className="remove-icon" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="slider-container">
                <label>Password Length: {passwordLength}</label>
                <input
                    type="range"
                    min="6"
                    max="28"
                    value={passwordLength}
                    onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                    className="custom-slider"
                />
            </div>

            <Button onClick={generatePasswordHandler} disabled={words.length < 3 || hasGenerated}>Generate Password</Button>

            {generatedPassword && (
                <div className="generated-password-area">
                    <div className="generated-password-container">
                        <p className={isShuffling ? "shuffling" : ""}>{generatedPassword}</p>
                        {strengthLabel && (
                            <p className="password-strength" style={{ color: strengthColor }}>
                                <strong>Strength: {strengthLabel}</strong>
                            </p>
                        )}
                    </div>
                    <div className="shuffle-copy-buttons">
                        <Button onClick={shufflePassword} disabled={isShuffling} imgSrc={refreshImg}>Refresh</Button>
                        <Button onClick={copyToClipboard} disabled={isCopied} imgSrc={copyIcon}>
                            {isCopied ? "COPIED" : "Copy"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalizedPassword;
