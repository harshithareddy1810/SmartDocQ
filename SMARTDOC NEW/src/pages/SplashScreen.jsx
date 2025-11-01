
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "/WelcomePage.css";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/welcome"); // Navigate to Welcome page after 3 sec
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <h1 className="splash-text">SmartDocQ</h1>
      <p className="splash-subtext">Your Smart Document Assistant</p>
    </div>
  );
};

export default SplashScreen;
