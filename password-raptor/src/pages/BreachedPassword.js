import React, { useState, useEffect } from 'react';
import "./BreachedPassword.css";
import Button from "../components/Button";
import sha1 from "crypto-js/sha1";

const BreachedPassword = () => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [breachResult, setBreachResult] = useState(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        document.title = "Password Raptor | Check Breached Passwords";
    }, []);

    const checkPassword = async () => {
        if (!password) return;
        setChecking(true);
        setBreachResult(null);

        const hash = sha1(password).toString().toUpperCase();
        const prefix = hash.slice(0, 5);
        const suffix = hash.slice(5);

        try {
            const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            const text = await res.text();

            const lines = text.split("\n");
            const foundLine = lines.find(line => line.startsWith(suffix));

            if (foundLine) {
                const count = parseInt(foundLine.split(":")[1]);
                setBreachResult({ found: true, count });
            } else {
                setBreachResult({ found: false });
            }
        } catch (err) {
            setBreachResult({ error: "Error checking password. Please try again later." });
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="breached-password-container">
            <h2>Breached Password Checker</h2>
            <p className="description">
                This tool checks if your password has ever appeared in a data breach.
                This is powered by the <strong>HaveIBeenPwned</strong> API, which searches
                millions of leaked passwords without sending your actual password to the internet.
            </p>

            <div className="password-input-section">
                <input
                    type="text"
                    value={password}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 50) {
                            setPassword(value);
                            if (value.trim() === "") {
                                setBreachResult(null);
                            }
                        }
                    }}
                    placeholder="Enter your password"
                    autoComplete="off"
                    name="security-check-input"
                    style={{ WebkitTextSecurity: showPassword ? "none" : "disc" }}
                />
                <Button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                </Button>
                <Button onClick={checkPassword} disabled={checking || !password}>
                    {checking ? "Checking..." : "Check Password"}
                </Button>
            </div>

            {breachResult && (
                <div className="breach-result">
                    {breachResult.error && <p className="error">{breachResult.error}</p>}
                    {breachResult.found === false && (
                        <p className="safe">✅ This password has not been found in any known breaches.</p>
                    )}
                    {breachResult.found === true && (
                        <p className="danger">
                            ⚠️ This password has been seen <strong>{breachResult.count.toLocaleString()}</strong> times in data breaches.
                            Consider changing it immediately.
                        </p>
                    )}
                </div>
            )}
            <div className="breach-info-static">
                <div className="breach-info-item">
                    <h4>Is my full password being sent to the internet?</h4>
                    <p>No. Only the first 5 characters of a hashed version of your password are sent to the API. This privacy technique, called k-Anonymity, ensures your full password is never revealed or stored.</p>
                </div>
                <div className="breach-info-item">
                    <h4>What does it mean if my password was found?</h4>
                    <p>
                        If your password appears in the breach database, it means it was exposed in at least one known data leak. You should stop using it immediately and replace it with a stronger, unique password.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BreachedPassword;
