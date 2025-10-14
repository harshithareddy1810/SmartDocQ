// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../../pages.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pauseScroll, setPauseScroll] = useState(false);

  const handleManualLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/login`, { email, password });
      const token = res.data?.token;
      const role = res.data?.role;
      
      console.log("Login response:", { token: token?.substring(0, 20) + "...", role });
      
      if (!token) throw new Error("No token returned");
      
      // Store role in localStorage before login
      localStorage.setItem("user_role", role || "student");
      
      login(token);
      
      // Navigate based on role
      if (role === "admin") {
        console.log("Navigating to admin dashboard");
        navigate('/admin');
      } else {
        navigate('/upload');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_BASE}/api/google-login`, {
        credential: credentialResponse.credential,
      });
      const token = res.data?.token;
      if (!token) throw new Error("No token returned");
      login(token);
      navigate("/upload");
    } catch {
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <div className="login-split" style={{ position: 'relative' }}>
      {/* Top-left brand logo linking to Welcome */}
      <div
        className="auth-top-logo"
        onClick={() => navigate('/')}
        title="Go to Welcome"
        style={{
          position: 'absolute', top: 14, left: 18, zIndex: 5, display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 12,
          padding: '6px 10px', cursor: 'pointer', backdropFilter: 'blur(8px)'
        }}
      >
        <svg width="28" height="28" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <linearGradient id="miniG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa"/>
              <stop offset="100%" stopColor="#22d3ee"/>
            </linearGradient>
          </defs>
          <circle cx="128" cy="92" r="44" fill="#bcd7ff"/>
          <rect x="84" y="72" width="88" height="40" rx="20" fill="#0b1220"/>
          <circle cx="108" cy="92" r="6" fill="#60a5fa"/>
          <circle cx="148" cy="92" r="6" fill="#60a5fa"/>
          <rect x="96" y="130" width="64" height="42" rx="12" fill="#bcd7ff"/>
          <rect x="112" y="140" width="32" height="22" rx="10" fill="url(#miniG)"/>
        </svg>
        <span style={{ fontWeight: 800, letterSpacing: '.3px', color: '#e5e7eb' }}>SmartDocQ</span>
      </div>
      <div className="login-left">
        <div className="grok-bg"></div>
        <div className="grok-sweep"></div>
        <div className="grok-title" style={{fontSize:'clamp(36px,9vw,120px)', left:'44%', top:'52%', color:'rgba(226,232,240,0.05)'}}>SmartDocQ</div>
        
        {/* Reviews Section */}
        <div className="login-reviews">
          {/* Robot Background */}
          <svg className="reviews-robot-bg" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AI bot background">
            <defs>
              <linearGradient id="robotGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#22d3ee"/>
              </linearGradient>
            </defs>
            {/* Bot head */}
            <circle cx="128" cy="92" r="44" fill="#bcd7ff" opacity="0.5"/>
            <rect x="84" y="72" width="88" height="40" rx="20" fill="#0b1220" opacity="0.6"/>
            {/* Eyes */}
            <circle cx="108" cy="92" r="6" fill="#60a5fa" opacity="0.8"/>
            <circle cx="148" cy="92" r="6" fill="#60a5fa" opacity="0.8"/>
            {/* Antennas */}
            <rect x="78" y="72" width="8" height="20" rx="4" fill="#7dd3fc" opacity="0.6"/>
            <rect x="170" y="72" width="8" height="20" rx="4" fill="#7dd3fc" opacity="0.6"/>
            {/* Body */}
            <rect x="96" y="130" width="64" height="42" rx="12" fill="#bcd7ff" opacity="0.5"/>
            <path d="M116 172h24c10 0 18 8 18 18v6H98v-6c0-10 8-18 18-18z" fill="#bcd7ff" opacity="0.5"/>
            {/* Chest glow */}
            <rect x="112" y="140" width="32" height="22" rx="10" fill="url(#robotGradient)" opacity="0.6"/>
            {/* Document */}
            <g transform="translate(160,132)">
              <rect x="0" y="0" width="58" height="72" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" opacity="0.6"/>
              <path d="M42 0v18a8 8 0 0 0 8 8h8" fill="#0f172a" opacity="0.6"/>
              <path d="M10 22h30M10 34h30M10 46h22" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
              <path d="M42 0l16 16" stroke="#334155" strokeWidth="2" opacity="0.6"/>
            </g>
            {/* Shadow */}
            <ellipse cx="128" cy="216" rx="68" ry="10" fill="rgba(0,0,0,0.3)"/>
          </svg>
          
          <h3 className="reviews-title">What Our Users Say</h3>
          <div className="reviews-container" onMouseEnter={() => setPauseScroll(true)} onMouseLeave={() => setPauseScroll(false)}>
            <div className="reviews-track">
              <div className="review-card">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"SmartDocQ has revolutionized how I handle research papers. I can extract key insights in minutes instead of hours!"</p>
                <div className="review-author">
                  <div className="author-avatar">👨‍🎓</div>
                  <div className="author-info">
                    <div className="author-name">Dr. Sarah Chen</div>
                    <div className="author-title">Research Scientist</div>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"As a student, this tool is a game-changer. I can quickly understand complex documents and prepare for exams efficiently."</p>
                <div className="review-author">
                  <div className="author-avatar">👩‍💼</div>
                  <div className="author-info">
                    <div className="author-name">Emily Rodriguez</div>
                    <div className="author-title">Graduate Student</div>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"The accuracy and speed of SmartDocQ is incredible. It understands context and provides relevant answers every time."</p>
                <div className="review-author">
                  <div className="author-avatar">👨‍💻</div>
                  <div className="author-info">
                    <div className="author-name">Michael Thompson</div>
                    <div className="author-title">Business Analyst</div>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"Finally, a tool that makes sense of legal documents! SmartDocQ helps me navigate complex contracts with ease."</p>
                <div className="review-author">
                  <div className="author-avatar">👩‍⚖️</div>
                  <div className="author-info">
                    <div className="author-name">Jennifer Walsh</div>
                    <div className="author-title">Attorney</div>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"This AI-powered document analysis is exactly what I needed for my PhD research. It saves me countless hours of manual reading."</p>
                <div className="review-author">
                  <div className="author-avatar">👨‍🔬</div>
                  <div className="author-info">
                    <div className="author-name">Dr. James Wilson</div>
                    <div className="author-title">PhD Candidate</div>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"SmartDocQ transformed our team's workflow. We can now process financial reports and contracts in record time."</p>
                <div className="review-author">
                  <div className="author-avatar">👩‍💼</div>
                  <div className="author-info">
                    <div className="author-name">Lisa Park</div>
                    <div className="author-title">Finance Manager</div>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"The citation feature is brilliant! I can trace every answer back to the exact page and section. Perfect for academic work."</p>
                <div className="review-author">
                  <div className="author-avatar">👨‍🏫</div>
                  <div className="author-info">
                    <div className="author-name">Prof. David Kumar</div>
                    <div className="author-title">University Professor</div>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"As a medical researcher, I need to stay updated with latest studies. SmartDocQ helps me quickly extract relevant findings."</p>
                <div className="review-author">
                  <div className="author-avatar">👩‍⚕️</div>
                  <div className="author-info">
                    <div className="author-name">Dr. Maria Santos</div>
                    <div className="author-title">Medical Researcher</div>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"The voice feature is amazing! I can ask questions while reviewing documents hands-free. Perfect for multitasking."</p>
                <div className="review-author">
                  <div className="author-avatar">👨‍💻</div>
                  <div className="author-info">
                    <div className="author-name">Alex Chen</div>
                    <div className="author-title">Software Engineer</div>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"SmartDocQ understands complex technical documentation better than any tool I've used. Highly recommended for developers!"</p>
                <div className="review-author">
                  <div className="author-avatar">👩‍💻</div>
                  <div className="author-info">
                    <div className="author-name">Rachel Green</div>
                    <div className="author-title">Tech Lead</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="auth-orb orb1"></div>
        <div className="auth-orb orb2"></div>

        <div className="login-card">
          <h1 className="logo">SmartDocQ</h1>
          <p className="subtitle">Sign in to continue</p>

          <form onSubmit={handleManualLogin}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email}
                     onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password}
                     onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="login-btn">Login</button>
          </form>

          <div style={{ textAlign: "center", margin: "20px 0", color: "#888" }}>OR</div>

          <div className="google-login-button-container">
            <GoogleLogin onSuccess={handleGoogleSuccess}
                         onError={() => setError("Google login failed. Please try again.")} />
          </div>

          <div className="extra-links">
            <a href="#">Forgot Password?</a>
            <Link to="/signup">Create an Account</Link>
          </div>
        </div>
      </div>
      <style>{`
        .auth-top-logo:hover span { color: #ffffff; }
      `}</style>
    </div>
  );
};

export default LoginPage;