
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogIn, FiUserPlus } from "react-icons/fi";

const WelcomePage = () => {
  const navigate = useNavigate();
  
  // Demo functionality state
  const [demoQuestion, setDemoQuestion] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  return (
    <div className="welcome-hero">
      {/* Grok-like luminous background and massive title */}
      <div className="grok-bg"></div>
      <div className="grok-sweep"></div>
      <div className="grok-title">SmartDocQ</div>
      <div className="welcome-orb orb1"></div>
      <div className="welcome-orb orb2"></div>
      <div className="welcome-nav">
        <div className="welcome-brand" onClick={() => navigate('/')}>SmartDocQ</div>
      </div>

      <div className="welcome-content">
        <div className="welcome-left">
          <div className="powered-by">POWERED BY&nbsp;<span>Gemini</span></div>
          <h1 className="welcome-h1">SmartDocQ: <span className="grad-text">Where AI Reads</span> So You Don’t<br></br> Have To.</h1>
          <p className="welcome-sub">Upload documents. Ask questions. Get answers fast — no manual scanning.</p>
          <p className="welcome-sub muted">Powered by Gemini for secure, reliable, and private document intelligence.</p>
          <div className="welcome-ctas">
            <button 
              className="cta-primary" 
              onClick={() => {
                // Add smooth transition effect
                document.body.style.transition = 'opacity 0.3s ease';
                document.body.style.opacity = '0.8';
                setTimeout(() => {
                  navigate('/login');
                  document.body.style.opacity = '1';
                }, 150);
              }}
            >
              Get Started →
            </button>
            <button 
              className="cta-secondary" 
              onClick={() => {
                // Add smooth transition effect
                document.body.style.transition = 'opacity 0.3s ease';
                document.body.style.opacity = '0.8';
                setTimeout(() => {
                  navigate('/signup');
                  document.body.style.opacity = '1';
                }, 150);
              }}
            >
              <FiUserPlus size={16} />&nbsp;Create Account
            </button>
          </div>
        </div>
        <div className="welcome-right">
          {/* Inline AI chatbot + document logo */}
          <svg className="welcome-bot" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AI bot with document">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#22d3ee"/>
              </linearGradient>
            </defs>
            {/* Bot head */}
            <circle cx="128" cy="92" r="44" fill="#bcd7ff"/>
            <rect x="84" y="72" width="88" height="40" rx="20" fill="#0b1220"/>
            {/* Eyes */}
            <circle cx="108" cy="92" r="6" fill="#60a5fa"/>
            <circle cx="148" cy="92" r="6" fill="#60a5fa"/>
            {/* Antennas */}
            <rect x="78" y="72" width="8" height="20" rx="4" fill="#7dd3fc"/>
            <rect x="170" y="72" width="8" height="20" rx="4" fill="#7dd3fc"/>
            {/* Body */}
            <rect x="96" y="130" width="64" height="42" rx="12" fill="#bcd7ff"/>
            <path d="M116 172h24c10 0 18 8 18 18v6H98v-6c0-10 8-18 18-18z" fill="#bcd7ff"/>
            {/* Chest glow */}
            <rect x="112" y="140" width="32" height="22" rx="10" fill="url(#g1)"/>
            {/* Document */}
            <g transform="translate(160,132)">
              <rect x="0" y="0" width="58" height="72" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2"/>
              <path d="M42 0v18a8 8 0 0 0 8 8h8" fill="#0f172a"/>
              <path d="M10 22h30M10 34h30M10 46h22" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"/>
              <path d="M42 0l16 16" stroke="#334155" strokeWidth="2"/>
            </g>
            {/* Shadow */}
            <ellipse cx="128" cy="216" rx="68" ry="10" fill="rgba(0,0,0,0.35)"/>
          </svg>
        </div>
      </div>

      {/* ChatPDF-style Features Section */}
      <div className="features-section">
        <div className="quote-section">
          <div className="quote-bubble">
            <p className="quote-text">
              "It's like ChatGPT, but for <span className="highlight">research papers</span>."
            </p>
            {/* <div className="quote-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <div className="author-name">Mushtaq Bilal, PhD</div>
                <div className="author-handle">@MushtaqBilalPhD</div>
              </div>
            </div> */}
          </div>
          {/* <div className="quote-icons">
            <div className="heart-icon">❤️</div>
            <div className="thumbs-icon">👍</div>
          </div> */}
        </div>

        <div className="features-intro">
          <h2 className="features-title">SmartDocQ in a Nutshell</h2>
          <p className="features-subtitle">Your PDF AI - like ChatGPT but for PDFs. Summarize and answer questions for free.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon purple">🔬</div>
            <h3 className="feature-title">For Researchers</h3>
            <p className="feature-description">Explore scientific papers, academic articles, and books to get the information you need for your research.</p>
            <div className="feature-demo">
              <div className="demo-document">
                <div className="demo-title">Unmoderated Card Sorting</div>
                <div className="demo-input">
                  <input 
                    type="text" 
                    placeholder="Ask any question..." 
                    value={demoQuestion}
                    onChange={(e) => setDemoQuestion(e.target.value)}
                  />
                  <button 
                    className="demo-btn"
                    onClick={() => {
                      if (demoQuestion.trim()) {
                        alert(`Demo: Processing question: "${demoQuestion}"`);
                        setDemoQuestion('');
                      }
                    }}
                  >▶</button>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">🎓</div>
            <h3 className="feature-title">For Students</h3>
            <p className="feature-description">Study for exams, get help with homework, and answer multiple choice questions faster than your classmates.</p>
            <div className="feature-demo">
              <div className="demo-question">
                <div className="question-text">What is the capital of France?</div>
                <div className="question-options">
                  <label>
                    <input 
                      type="radio" 
                      name="q1" 
                      value="Berlin"
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                    /> Berlin
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="q1" 
                      value="Madrid"
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                    /> Madrid
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="q1" 
                      value="Rome"
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                    /> Rome
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="q1" 
                      value="Paris"
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                    /> Paris
                  </label>
                </div>
                <button 
                  className="submit-btn"
                  onClick={() => {
                    if (selectedAnswer) {
                      const isCorrect = selectedAnswer === 'Paris';
                      alert(`Demo: ${isCorrect ? 'Correct! Paris is the capital of France.' : `Incorrect. The correct answer is Paris.`}`);
                      setDemoSubmitted(true);
                    } else {
                      alert('Demo: Please select an answer first.');
                    }
                  }}
                >
                  {demoSubmitted ? 'Submitted!' : 'Submit Answer'}
                </button>
              </div>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">💼</div>
            <h3 className="feature-title">For Professionals</h3>
            <p className="feature-description">Navigate legal contracts, financial reports, manuals, and training material. Ask questions to any PDF to stay ahead.</p>
            <div className="feature-demo">
              <div className="demo-report">
                <div className="report-title">FINANCIAL_REPORT.pdf</div>
                <div className="report-charts">
                  <div className="bar-chart"></div>
                  <div className="pie-chart"></div>
                </div>
                <div className="demo-chat">
                  <div className="chat-bubble">What's the net profit for Q2</div>
                  <button 
                    className="ask-btn"
                    onClick={() => {
                      alert('Demo: Analyzing financial report... Net profit for Q2: $2.4M (up 15% from Q1)');
                    }}
                  >Ask</button>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon yellow">💬</div>
            <h3 className="feature-title">Cited Sources</h3>
            <p className="feature-description">Built-in citations anchor responses to PDF references. No more page-by-page searching.</p>
            <div className="feature-demo">
              <div className="demo-chat-interface">
                <div className="chat-question">Who is the author of this article?</div>
                <div className="chat-response">
                  <div className="response-bubble">The author of the article "Moderated and Unmoderated Card Sorting in UX Design" is Marcin Majka</div>
                  <button 
                    className="scroll-btn"
                    onClick={() => {
                      alert('Demo: Scrolling to Page 1 where the author information is located...');
                    }}
                  >Scroll to Page 1</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Guidance Section */}
        <div className="user-guidance-section">
          <div className="guidance-container">
            <h2 className="guidance-title">How to Get Started with SmartDocQ</h2>
            <div className="guidance-steps">
              <div className="guidance-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Upload Your Document</h3>
                  <p>Simply drag and drop your PDF, Word document, or text file into our secure upload area. SmartDocQ supports most document formats and processes them instantly.</p>
                </div>
              </div>
              <div className="guidance-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Ask Questions Naturally</h3>
                  <p>Type or speak your questions in plain English. Whether you need summaries, specific information, or analysis - just ask like you're talking to a knowledgeable assistant.</p>
                </div>
              </div>
              <div className="guidance-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Get Instant Answers</h3>
                  <p>Receive accurate, contextual responses with source citations. SmartDocQ references specific pages and sections, so you know exactly where the information comes from.</p>
                </div>
              </div>
              <div className="guidance-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Export & Share</h3>
                  <p>Download your conversations, copy answers, or share insights with your team. SmartDocQ helps you turn documents into actionable knowledge.</p>
                </div>
              </div>
            </div>
            <div className="guidance-tips">
              <h3>Pro Tips for Better Results</h3>
              <div className="tips-grid">
                <div className="tip-item">
                  <div className="tip-icon">💡</div>
                  <p><strong>Be Specific:</strong> Ask detailed questions like "What are the main findings in section 3?" instead of "Summarize this."</p>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">🎯</div>
                  <p><strong>Use Keywords:</strong> Mention specific terms, names, or concepts from your document for more accurate results.</p>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">📊</div>
                  <p><strong>Ask for Analysis:</strong> Request comparisons, trends, or insights that require understanding multiple parts of your document.</p>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">🔍</div>
                  <p><strong>Follow Up:</strong> Build on previous answers with follow-up questions for deeper understanding.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <footer className="professional-footer">
          <div className="footer-container">
            <div className="footer-content">
              <div className="footer-brand">
                <h3>SmartDocQ</h3>
                <p>Transform your documents into intelligent conversations. Powered by advanced AI to make information accessible and actionable.</p>
                <div className="footer-social">
                  <a href="#" className="social-link">Twitter</a>
                  <a href="#" className="social-link">LinkedIn</a>
                  <a href="#" className="social-link">GitHub</a>
                </div>
              </div>
              <div className="footer-links">
                <div className="footer-column">
                  <h4>Product</h4>
                  <ul>
                    <li><a href="#">Features</a></li>
                    <li><a href="#">Pricing</a></li>
                    <li><a href="#">API</a></li>
                    <li><a href="#">Integrations</a></li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h4>Resources</h4>
                  <ul>
                    <li><a href="#">Documentation</a></li>
                    <li><a href="#">Help Center</a></li>
                    <li><a href="#">Tutorials</a></li>
                    <li><a href="#">Blog</a></li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h4>Company</h4>
                  <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Contact</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-bottom-content">
                <p>&copy; 2024 SmartDocQ. All rights reserved.</p>
                <div className="footer-bottom-links">
                  <a href="#">Privacy</a>
                  <a href="#">Terms</a>
                  <a href="#">Cookies</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;
