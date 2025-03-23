import React, { useState, useEffect } from 'react';
import './About.css';

const About = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        document.title = "Password Raptor | About";
    }, []);

    const faqs = [
        {
            question: "What is Password Raptor?",
            answer: "Password Raptor is a tool designed to help users generate and evaluate secure passwords using personalized inputs and advanced password analysis techniques."
        },
        {
            question: "How does Password Raptor ensure password security?",
            answer: "It encourages the use of diverse characters and ensures randomness in generated passwords, but users can adjust the level of randomness by defining what to include and exclude. However, the tool must not be blamed in case of any cyberattacks, as account and password security is not always about the password strength."
        },
        {
            question: "Is inclusion of different characters important to create a secure password?",
            answer: "Yes, including uppercase, lowercase, numbers and symbols makes it significantly harder for attackers to guess or brute-force your password."
        },
        {
            question: "Why should I avoid using common words in passwords?",
            answer: "Common words make passwords vulnerable to dictionary attacks. Password Raptor detects and penalizes the use of such words."
        },
        {
            question: "How long should my password be?",
            answer: "A secure password should be at least 12 characters long. Longer passwords are generally more secure, but make sure there is randomness and diversity of characters."
        },
        {
            question: "What is the advantage of using a personalized password?",
            answer: "Personalized passwords are easier to remember and can still be secure when combined with randomness and diverse character types. Despite this, using random and long passwords is recommended."
        },
        {
            question: "Does Password Raptor store my passwords?",
            answer: "No, Password Raptor does not store or save your passwords. All password generation and evaluation happen locally in your browser."
        },
        {
            question: "Should I use different passwords on different platforms?",
            answer: "Yes, using different passwords across different applications, websites or platforms is important to secure your accounts."
        },
        {
            question: "What makes a password strong?",
            answer: "A strong password is long, random and includes a mix of uppercase, lowercase, numbers and symbols. It should not include easily guessable patterns or common words."
        },
        {
            question: "Is Password Raptor free to use?",
            answer: "Yes, Password Raptor is completely free to use and does not require any account or registration."
        },
        {
            question: "How are passphrases generated?",
            answer: "Passphrases are created by randomly selecting words from a dictionary. You can also choose to include symbols, numbers and case variations for added complexity."
        },
        {
            question: "What does 'crack time estimation' mean?",
            answer: "Crack time estimation shows how long it would take an attacker to brute-force your password, using common hardware and algorithms."
        },
        {
            question: "How to secure accounts and passwords?",
            answer: "Account and password security is major concern of many organizations. Although Password Raptor provides tools to generate and evaluate passwords, it does not guarantee security as there are other factors that contribute to account and password security. You can learn more about cybersecurity by searching for credible journals and articles from various sources."
        },
        {
            question: "Are passwords checked against known breaches?",
            answer: "No, Password Raptor's password evaluation tool does not check against breach databases, but there is such tool in Check Breached Password page that you can use on your own."
        }
    ];

    const handleToggle = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const half = Math.ceil(faqs.length / 2);
    const leftFaqs = faqs.slice(0, half);
    const rightFaqs = faqs.slice(half);

    return (
        <div className="about-container">
            <h2>About Password Raptor</h2>
            <p>
                Password Raptor has various tools that helps you evaluate and create memorable and strong passwords for a secure digital experience.
            </p>

            <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-columns">
                    <ul className="faq-list">
                        {leftFaqs.map((faq, index) => (
                            <li key={index} className="faq-item">
                                <div className="faq-question" onClick={() => handleToggle(index)}>
                                    {faq.question}
                                    <span className="faq-toggle-icon">{activeIndex === index ? '-' : '+'}</span>
                                </div>
                                {activeIndex === index && (
                                    <div className="faq-answer">{faq.answer}</div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <ul className="faq-list">
                        {rightFaqs.map((faq, index) => {
                            const trueIndex = index + half;
                            return (
                                <li key={trueIndex} className="faq-item">
                                    <div className="faq-question" onClick={() => handleToggle(trueIndex)}>
                                        {faq.question}
                                        <span className="faq-toggle-icon">{activeIndex === trueIndex ? '-' : '+'}</span>
                                    </div>
                                    {activeIndex === trueIndex && (
                                        <div className="faq-answer">{faq.answer}</div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <div className="contact-section">
                <h3>Contact Us</h3>
                <p>If you have any questions or suggestions about Password Raptor, feel free to reach out at:</p>
                <p><strong>paswordraptor@gmail.com</strong></p>
                <p className='right'>© 2025 Westminster International University in Tashkent. All rights reserved.</p>
            </div>
        </div>
    );
};

export default About;
