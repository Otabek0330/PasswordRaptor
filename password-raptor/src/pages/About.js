import React, { useState } from 'react';
import './About.css';

const About = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            question: "What is Password Raptor?",
            answer: "Password Raptor is a tool designed to help users generate and evaluate secure passwords using personalized inputs and advanced password analysis techniques."
        },
        {
            question: "How does Password Raptor ensure password security?",
            answer: "Password Raptor uses algorithms and libraries like zxcvbn to evaluate password strength. It encourages the use of diverse characters and ensures randomness in generated passwords."
        },
        {
            question: "Is inclusion of different characters important to create a secure password?",
            answer: "Yes, including uppercase, lowercase, numbers, and symbols makes it significantly harder for attackers to guess or brute-force your password."
        },
        {
            question: "Why should I avoid using common words in passwords?",
            answer: "Common words make passwords vulnerable to dictionary attacks. Password Raptor detects and penalizes the use of such words."
        },
        {
            question: "How long should my password be?",
            answer: "A secure password should be at least 12 characters long. Longer passwords are generally more secure."
        },
        {
            question: "What is the advantage of using a personalized password?",
            answer: "Personalized passwords are easier to remember and can still be secure when combined with randomness and diverse character types."
        },
        {
            question: "Does Password Raptor store my passwords?",
            answer: "No, Password Raptor does not store or save your passwords. All password generation and evaluation happen locally in your browser."
        },
        {
            question: "Can I use Password Raptor for professional purposes?",
            answer: "Yes, Password Raptor is suitable for both personal and professional use, especially when strong passwords are critical."
        },
        {
            question: "What makes a password strong?",
            answer: "A strong password is long, random, and includes a mix of uppercase, lowercase, numbers, and symbols. It should not include easily guessable patterns or common words."
        },
        {
            question: "Is Password Raptor free to use?",
            answer: "Yes, Password Raptor is completely free to use and does not require any account or registration."
        },
    ];

    const handleToggle = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="about-container">
            <h2>About Password Raptor</h2>
            <p>
                Intelligent password analyzer that helps you evaluate and create memorable and strong passwords for a secure digital experience.
            </p>
            <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <ul className="faq-list">
                    {faqs.map((faq, index) => (
                        <li key={index} className="faq-item">
                            <div
                                className="faq-question"
                                onClick={() => handleToggle(index)}
                            >
                                {faq.question}
                                <span className="faq-toggle-icon">{activeIndex === index ? '-' : '+'}</span>
                            </div>
                            {activeIndex === index && (
                                <div className="faq-answer">
                                    {faq.answer}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default About;
