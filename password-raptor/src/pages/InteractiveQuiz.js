import React, { useState, useEffect } from "react";
import zxcvbn from "zxcvbn";
import "./InteractiveQuiz.css";
import Button from "../components/Button";
import copyImg from "../assets/images/copy.png";
import tickImg from "../assets/images/tick.png";
import changeImg from "../assets/images/change.png";
import nextImg from "../assets/images/next.png";
import previousImg from "../assets/images/previous.png";
import shuffleImg from "../assets/images/refresh.png";

const questionsPool = [
  { question: "What is your favorite food?", type: "text" },
  { question: "What is your pet's name?", type: "text" },
  { question: "What city were you born in?", type: "text" },
  { question: "What is your favorite movie?", type: "text" },
  { question: "Who is the celebrity you admire?", type: "text" },
  { question: "What is your favorite color?", type: "text" },
  { question: "What is your lucky number?", type: "number" },
  { question: "What is the name of your best friend?", type: "text" },
  { question: "What is your favorite sport?", type: "text" },
  { question: "When were you born?", type: "number" }
];

const strengthColors = ["red", "orange", "yellow", "lightblue", "blue"];
const strengthLabels = ["Very Weak", "Weak", "Moderate", "Strong", "Very Strong"];

const InteractiveQuiz = () => {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(5).fill(""));
  const [validationErrors, setValidationErrors] = useState(Array(5).fill(""));
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [passwordLength, setPasswordLength] = useState(12);
  const [copyIcon, setCopyIcon] = useState(copyImg);
  const [isCopied, setIsCopied] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [disableCopy, setDisableCopy] = useState(false);
  const [disableShuffle, setDisableShuffle] = useState(false);

  useEffect(() => {
    startNewQuiz();
  }, []);

  const startNewQuiz = () => {
    const shuffled = [...questionsPool].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuizQuestions(shuffled);
    setAnswers(Array(5).fill(""));
    setValidationErrors(Array(5).fill(""));
    setGeneratedPassword("");
    setPasswordStrength(null);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setDisableCopy(false);
    setDisableShuffle(false);
  };

  const handleAnswerChange = (value) => {
    if (value.length > 10) {
      validateAnswer(currentQuestionIndex, value);
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = value;
    setAnswers(updatedAnswers);
    validateAnswer(currentQuestionIndex, value);
  };

  const validateAnswer = (index, value) => {
    let error = "";
    const questionType = quizQuestions[index]?.type;

    if (questionType === "number" && isNaN(value)) {
      error = "Invalid input. Please enter a valid number.";
    } else if (questionType === "text") {
      if (value.length < 3) {
        error = "Answer must be at least 3 characters.";
      } else if (value.length > 10) {
        error = "Answer cannot exceed 10 characters.";
      }
    }

    const updatedErrors = [...validationErrors];
    updatedErrors[index] = error;
    setValidationErrors(updatedErrors);
  };

  const changeCurrentQuestion = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];

    const availableQuestions = questionsPool.filter(
      (q) =>
        !quizQuestions.some(existing => existing.question === q.question) &&
        q.question !== currentQuestion.question
    );

    if (availableQuestions.length === 0) return;

    const newQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    const updatedQuestions = [...quizQuestions];
    updatedQuestions[currentQuestionIndex] = newQuestion;

    setQuizQuestions(updatedQuestions);

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = "";
    setAnswers(updatedAnswers);

    const updatedErrors = [...validationErrors];
    updatedErrors[currentQuestionIndex] = "";
    setValidationErrors(updatedErrors);
  };

  const generatePassword = (length = passwordLength) => {
    let validAnswers = answers
      .filter(ans => ans.length > 0)
      .map(ans => ans.substring(0, 7).replace(/\s/g, ""));

    let selectedWords = validAnswers.sort(() => Math.random() - 0.5).slice(0, 3);

    selectedWords = selectedWords.map(word =>
      Math.random() < 0.5 ? word.toUpperCase() : word.toLowerCase()
    );

    let passwordBase = selectedWords.join("");

    const symbols = "!@#$%^&*";
    let addedSymbols = "";
    while (addedSymbols.length < 3) {
      let randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      if (!addedSymbols.includes(randomSymbol)) {
        addedSymbols += randomSymbol;
      }
    }

    for (let symbol of addedSymbols) {
      let insertIndex = Math.floor(Math.random() * passwordBase.length);
      passwordBase =
        passwordBase.slice(0, insertIndex) +
        symbol +
        passwordBase.slice(insertIndex);
    }

    if (!/[A-Z]/.test(passwordBase)) {
      passwordBase += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    }
    if (!/[a-z]/.test(passwordBase)) {
      passwordBase += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    }

    const additionalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    while (passwordBase.length < passwordLength) {
      passwordBase += additionalChars[Math.floor(Math.random() * additionalChars.length)];
    }

    passwordBase = passwordBase.slice(0, passwordLength);

    setGeneratedPassword(passwordBase);
    setPasswordStrength(zxcvbn(passwordBase));
    setQuizFinished(true);
  };

  const shufflePassword = () => {
    if (!disableShuffle) {
      setDisableShuffle(true);
      setIsShuffling(true);

      const characterPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      const interval = setInterval(() => {
        let tempPassword = "";
        for (let i = 0; i < passwordLength; i++) {
          tempPassword += characterPool[Math.floor(Math.random() * characterPool.length)];
        }
        setGeneratedPassword(tempPassword);
      }, 30);

      setTimeout(() => {
        clearInterval(interval);
        generatePassword(passwordLength);
        setIsShuffling(false);
        setDisableShuffle(false);
      }, 500);
    }
  };

  const copyToClipboard = () => {
    if (!disableCopy) {
      setDisableCopy(true);
      navigator.clipboard.writeText(generatedPassword);
      setCopyIcon(tickImg);
      setIsCopied(true);

      setTimeout(() => {
        setCopyIcon(copyImg);
        setIsCopied(false);
        setDisableCopy(false);
      }, 2000);
    }
  };

  const isFinishDisabled = answers.some(a => a === "") || validationErrors.some(e => e !== "");

  return (
    <div className="interactive-quiz-container">
      <h2>Interactive Quiz Password Generator</h2>
      <p className="quiz-explanation">
        Answer five simple questions to generate a strong and unique password.
        Your answers will be combined and enhanced with security features like symbols and case variations.
        Make sure each answer is between 3 and 10 characters long. Once all questions are answered,
        click "Finish and Generate Password" to get your secure password. Your answers are not stored or shared.
      </p>
      {!quizFinished && quizQuestions.length > 0 && (
        <div className="quiz-question">
          <label>{quizQuestions[currentQuestionIndex]?.question}</label>
          <input
            type="text"
            value={answers[currentQuestionIndex]}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Your answer"
          />
          {validationErrors[currentQuestionIndex] && (
            <p className="error-message">{validationErrors[currentQuestionIndex]}</p>
          )}
        </div>
      )}
      {!quizFinished && (
        <div className="quiz-navigation">
          <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0} imgSrc={previousImg}>
            Previous
          </Button>
          <Button onClick={changeCurrentQuestion} imgSrc={changeImg}>
            Change Question
          </Button>
          <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} disabled={currentQuestionIndex === 4} imgSrc={nextImg}>
            Next
          </Button>
        </div>
      )}
      {!quizFinished ? (
        <>
          <Button onClick={generatePassword} disabled={isFinishDisabled}>
            Finish and Generate Password
          </Button>
          {isFinishDisabled && currentQuestionIndex === 4 && (
            <p className="warning-message">Please answer all questions correctly to enable this button.</p>
          )}
        </>
      ) : (
        <>
          <div className="generated-password-container">
            <div className="generated-top">
              <p className={`generated-password ${isShuffling ? "shuffling" : ""}`}>{generatedPassword}</p>
              {passwordStrength && (
                <p className="password-strength" style={{ color: strengthColors[passwordStrength.score] }}>
                  <strong>Strength: {strengthLabels[passwordStrength.score]}</strong>
                </p>
              )}
            </div>
            <div className="button-group">
              <Button onClick={shufflePassword} imgSrc={shuffleImg} disabled={disableShuffle}>
                Refresh
              </Button>
              <Button onClick={copyToClipboard} imgSrc={copyIcon} disabled={disableCopy}>
                {disableCopy ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <div className="password-length-slider">
            <label htmlFor="lengthSlider">Password Length: {passwordLength}</label>
            <input
              id="lengthSlider"
              type="range"
              min="8"
              max="30"
              value={passwordLength}
              onChange={(e) => {
                const newLength = parseInt(e.target.value);
                setPasswordLength(newLength);
                generatePassword(newLength);
              }}
            />
          </div>
          <Button onClick={startNewQuiz}>Take Another Quiz</Button>
        </>
      )}
    </div>
  );
};

export default InteractiveQuiz;
