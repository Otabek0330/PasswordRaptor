import React, { useState, useEffect } from 'react';
import zxcvbn from 'zxcvbn';
import './PersonalizedPassword.css';
import Button from '../components/Button';
import wrongImg from '../assets/images/wrong.png';
import copyImg from '../assets/images/copy.png';
import tickImg from '../assets/images/tick.png';

const PersonalizedPassword = () => {
    const [words, setWords] = useState([]);
    const [newWord, setNewWord] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(null);
    const [passwordLength, setPasswordLength] = useState(12);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [copyIcon, setCopyIcon] = useState(copyImg);
    const [isCopied, setIsCopied] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);

    useEffect(() => {
        document.title = "Password Raptor | Generate Personalized Password";
      }, []);

    const addWord = () => {
        if (words.length < 7 && newWord.length >= 3 && newWord.length <= 14 && newWord.trim() !== "") {
            setWords([...words, newWord.trim()]);
            setNewWord('');
            setHasGenerated(false);
        }
    };

    const removeWord = (index) => {
        setWords(words.filter((_, i) => i !== index));
        setHasGenerated(false); // Reset generated state
    };

    const generatePasswordHandler = () => {
        if (words.length < 3) {
            setGeneratedPassword("Please enter at least 3 words.");
            setPasswordStrength(null);
            return;
        }

        const shuffledWords = [...words].sort(() => 0.5 - Math.random());
        const numWordsToUse = Math.floor(Math.random() * (Math.min(10, shuffledWords.length) - 3 + 1)) + 3;
        const selectedWords = shuffledWords.slice(0, numWordsToUse);
        let password = "";

        for (let i = 0; i < selectedWords.length; i++) {
            let word = selectedWords[i];

            if (word.length > 4 && Math.random() < 0.3) {
                const splitIndex = Math.floor(word.length / 2);
                const part1 = word.slice(0, splitIndex);
                const part2 = word.slice(splitIndex);
                const randomNum = Math.floor(Math.random() * 10);
                const randomSymbol = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'][Math.floor(Math.random() * 10)];
                word = part1 + (Math.random() < 0.5 ? randomNum : randomSymbol) + part2;
            }

            password += word;

            if (i < selectedWords.length - 1) {
                const separator = ['-', '_', '.', ''][Math.floor(Math.random() * 4)];
                const symbol = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'][Math.floor(Math.random() * 10)];
                if (Math.random() < 0.3) {
                    password += symbol;
                } else {
                    password += separator;
                }
            }
        }

        if (Math.random() < 0.5) {
            password = password.toUpperCase();
        } else if (Math.random() < 0.75) {
            password = password.toLowerCase();
        } else {
            password = password.charAt(0).toUpperCase() + password.slice(1);
        }

        if (password.length > passwordLength) {
            password = password.slice(0, passwordLength);
        } else if (password.length < passwordLength) {
            const paddingLength = passwordLength - password.length;
            const paddingCharacters = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            let padding = "";
            for (let i = 0; i < paddingLength; i++) {
                padding += paddingCharacters[Math.floor(Math.random() * paddingCharacters.length)];
            }
            password += padding;
        }

        setGeneratedPassword(password);
        const strength = zxcvbn(password);
        setPasswordStrength(strength);
        setHasGenerated(true);
    };

    const shufflePassword = () => {
        if (generatedPassword) {
            setIsShuffling(true);
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
                setIsShuffling(false);
                generatePasswordHandler();
            }, 500);
        }
    };

    useEffect(() => {
        if (hasGenerated) {
            generatePasswordHandler();
        }
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

    const getStrengthColor = (score) => {
        switch (score) {
            case 0: return 'red';
            case 1: return 'lightcoral';
            case 2: return 'yellow';
            case 3: return '#03ecfc';
            case 4: return 'blue';
            default: return 'gray';
        }
    };

    const getStrengthLabel = (score) => {
        switch (score) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Moderate';
            case 3: return 'Strong';
            case 4: return 'Very Strong';
            default: return '';
        }
    };

    return (
        <div className="personalized-password-container">
            <h2>Personalized Password Creation</h2>
            <p className="instructions">Input from at least 3 up to 7 words, with each word being at least 3 characters long and the tool will generate a personalized password for you.</p>
            <div className="input-and-buttons">
                <input
                    type="text"
                    maxLength={14}
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Enter a word (max 14 letters)"
                    className="word-input"
                />
                <Button onClick={addWord} disabled={words.length >= 7 || newWord.length < 3 || newWord.trim() === ""}>Add</Button>
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
                <label htmlFor="passwordLength" className="slider-label">
                    Password Length: {passwordLength}
                </label>
                <input
                    type="range"
                    min="6"
                    max="28"
                    value={passwordLength}
                    onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                    className="custom-slider"
                    id="passwordLength"
                />
            </div>

            <Button onClick={generatePasswordHandler} disabled={words.length < 3 || hasGenerated}>Generate Password</Button>

            {generatedPassword && (
                <div className="generated-password-area">
                    <div className="generated-password-container">
                        <p className={isShuffling ? "shuffling" : ""}>{generatedPassword}</p>
                        {passwordStrength && (
                            <p className="password-strength" style={{ color: getStrengthColor(passwordStrength.score) }}>
                                <strong>Strength: {getStrengthLabel(passwordStrength.score)}</strong>
                            </p>
                        )}
                    </div>
                    <div className="shuffle-copy-buttons">
                        <Button onClick={shufflePassword} disabled={isShuffling} className="shuffle-button">Shuffle</Button>
                        <Button onClick={copyToClipboard} disabled={isCopied} imgSrc={copyIcon} imgAlt="Copy Icon">
                            {isCopied ? "COPIED" : "Copy"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalizedPassword;
