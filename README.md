# Password Raptor

Smart, secure, and user-friendly password toolkit built with React.  
Designed to help users evaluate, generate, and strengthen passwords with advanced security insights.

---

## Overview

**Password Raptor** is a full-featured password utility platform that combines password generation, evaluation, and breach checking into one intuitive app. It leverages powerful tools like `zxcvbn` for entropy-based analysis and integrates with the [Have I Been Pwned API](https://haveibeenpwned.com/API/v3) for breach detection — all while prioritizing privacy and UX.

---

## Features

- **Password Strength Evaluation**  
  Real-time analysis with entropy and crack time logic.

- 🛠**Random Password Generator**  
  Customizable character sets and length control.

- **Passphrase Generator**  
  Creates easy-to-remember secure passphrases using a dictionary.

- **Interactive Quiz-Based Generator**  
  Generates a personalized password based on answers to fun questions.

- **Breached Password Checker**  
  Checks passwords against public data breaches using HIBP API (k-Anonymity).

- **Responsive Design**  
  Optimized for mobile, tablet, and desktop.

---

## Tech Stack

- **Frontend**: React
- **Styling**: CSS (custom + responsive media queries)
- **Security Tools**: 
  - [`zxcvbn`](https://github.com/dropbox/zxcvbn) (Password strength estimation)
  - [`crypto-js`](https://www.npmjs.com/package/crypto-js) (SHA1 hashing)
- **API**: [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)

---

## Getting Started

### Installation

```bash
git clone https://github.com/yourusername/password-raptor.git
cd password-raptor
npm install
npm start
