import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import "./Home.css";
import evaluateImg from "../assets/images/evaluate.png";
import generateImg from "../assets/images/generate.png";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Password Raptor | Home";
  }, []);

  return (
    <section className="hero">
      <div className="left-content">
        <h2>
          Secure your digital world <span>with strong, memorable passwords.</span>
        </h2>
        <p>Combining security with usability to empower your digital safety.</p>
        <div className="hero-buttons">
          <Button
            onClick={() => navigate("/create")}
            imgSrc={generateImg}
            imgAlt="Generate Icon"
          >
            Generate Password
          </Button>

          <Button
            onClick={() => navigate("/evaluate")}
            imgSrc={evaluateImg}
            imgAlt="Evaluate Icon"
          >
            Evaluate Password
          </Button>
        </div>
        <div className="additional">
          <h3>Start now to improve your password hygiene!</h3>
          <p>Everything you provide to evaluate or generate passwords is not stored or shared. We respect your privacy and the safety of your passwords.</p>
        </div>
        <div className="copyright">
          © 2025 Westminster International University in Tashkent. All rights reserved.
        </div>
      </div>
    </section>
  );
};

export default Home;
