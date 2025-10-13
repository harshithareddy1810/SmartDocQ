import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "../../pages.css"; // Ensure this path is correct

// --- Signup Page Component ---
const SignupPage = ({ users, setUsers }) => {
  const navigate = useNavigate();

  // --- State ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [pauseScroll, setPauseScroll] = useState(false);

  // --- Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Google Sign-Up Logic ---
  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        console.log("Google User Info:", userInfo.data);
        alert(`Account created for ${userInfo.data.name}!`);
        navigate("/upload");
      } catch (error) {
        console.error("Failed to fetch user info from Google:", error);
      }
    },
    onError: () => {
      console.error("Google Sign-up Failed");
    },
  });

  // --- Manual Signup ---
  const handleManualSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post((import.meta.env.VITE_API_BASE || "http://localhost:8080") + "/api/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("API call failed:", error);
      setError("Could not connect to the server. Please try again later.");
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
            <linearGradient id="miniG2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa"/>
              <stop offset="100%" stopColor="#22d3ee"/>
            </linearGradient>
          </defs>
          <circle cx="128" cy="92" r="44" fill="#bcd7ff"/>
          <rect x="84" y="72" width="88" height="40" rx="20" fill="#0b1220"/>
          <circle cx="108" cy="92" r="6" fill="#60a5fa"/>
          <circle cx="148" cy="92" r="6" fill="#60a5fa"/>
          <rect x="96" y="130" width="64" height="42" rx="12" fill="#bcd7ff"/>
          <rect x="112" y="140" width="32" height="22" rx="10" fill="url(#miniG2)"/>
        </svg>
        <span style={{ fontWeight: 800, letterSpacing: '.3px', color: '#e5e7eb' }}>SmartDocQ</span>
      </div>
      {/* -------- Left visual panel -------- */}
      <div className="login-left">
        <div className="grok-bg"></div>
        <div className="grok-sweep"></div>
        <div
          className="grok-title"
          style={{
            fontSize: "clamp(36px,9vw,120px)",
            left: "44%",
            top: "52%",
            color: "rgba(226,232,240,0.05)",
          }}
        >
          SmartDocQ
        </div>

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

      {/* -------- Right signup form -------- */}
      <div className="login-right">
        <div className="auth-orb orb1"></div>
        <div className="auth-orb orb2"></div>

      <div className="signup-card">
        <h1 className="logo">SmartDocQ</h1>
        <p className="subtitle">Create your account</p>

        <form onSubmit={handleManualSignup}>
          <div className="input-group">
            <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
          </div>

          <div className="input-group">
            <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
          </div>

          <div className="input-group">
            <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
          </div>

          {error && <p className="error">{error}</p>}

            <button type="submit" className="signup-btn">
              Sign Up
            </button>
        </form>

          <div
            style={{
              textAlign: "center",
              margin: "20px 0",
              color: "#888",
            }}
          >
            OR
          </div>

          <button
            onClick={() => handleGoogleSignup()}
            className="google-signin-btn"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
            />
          Sign Up with Google
        </button>

        <div className="extra-links">
            <p>
              Already have an account?{" "}
              <span className="link" onClick={() => navigate("/login")}>
                Login
              </span>
          </p>
        </div>
        </div> {/* closes signup-card */}
      </div>   {/* closes login-right */}
      <style>{`
        .auth-top-logo:hover span { color: #ffffff; }
      `}</style>
    </div>
  );
};

export default SignupPage;
