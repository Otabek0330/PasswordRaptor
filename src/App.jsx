import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import NavBar from './components/NavBar/NavBar.jsx';
import Home from './pages/Home/Home.jsx';
import PasswordCreation from './pages/PasswordCreation/PasswordCreation.jsx';
import PasswordEvaluation from './pages/PasswordEvaluation/PasswordEvaluation.jsx';
import PasswordComparison from './pages/PasswordComparison/PasswordComparison.jsx';
import BreachCheck from './pages/BreachCheck/BreachCheck.jsx';
import About from './pages/About/About.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <NavBar />
        <main className="app__main">
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/create"  element={<PasswordCreation />} />
            <Route path="/evaluate" element={<PasswordEvaluation />} />
            <Route path="/compare" element={<PasswordComparison />} />
            <Route path="/breach"  element={<BreachCheck />} />
            <Route path="/about"   element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
