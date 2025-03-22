import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import PasswordCreation from "./pages/PasswordCreation";
import PasswordEvaluation from "./pages/PasswordEvaluation";
import PersonalizedPassword from "./pages/PersonalizedPassword";
import BreachedPassword from "./pages/BreachedPassword";
import InteractiveQuiz from "./pages/InteractiveQuiz";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <div>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/personalized" element={<PersonalizedPassword />} />
          <Route path="/create" element={<PasswordCreation />} />
          <Route path="/evaluate" element={<PasswordEvaluation />} />
          <Route path="/breached" element={<BreachedPassword />} />
          <Route path="/quiz" element={<InteractiveQuiz />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
