import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
  const isAuthOrHome = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';
  return (
    <header className="app-header">
      <div className="app-header__left" onClick={() => navigate('/')}> 
        <span className="app-logo" aria-hidden="true">
          <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" role="img">
            <defs>
              <linearGradient id="hdr-g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#22d3ee"/>
              </linearGradient>
            </defs>
            <circle cx="128" cy="92" r="44" fill="#bcd7ff"/>
            <rect x="84" y="72" width="88" height="40" rx="20" fill="#0b1220"/>
            <circle cx="108" cy="92" r="6" fill="#60a5fa"/>
            <circle cx="148" cy="92" r="6" fill="#60a5fa"/>
            <rect x="78" y="72" width="8" height="20" rx="4" fill="#7dd3fc"/>
            <rect x="170" y="72" width="8" height="20" rx="4" fill="#7dd3fc"/>
            <rect x="96" y="130" width="64" height="42" rx="12" fill="#bcd7ff"/>
            <rect x="112" y="140" width="32" height="22" rx="10" fill="url(#hdr-g1)"/>
            <g transform="translate(160,132)">
              <rect x="0" y="0" width="58" height="72" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2"/>
              <path d="M10 22h30M10 34h30M10 46h22" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"/>
            </g>
          </svg>
        </span>
        <span className="app-brand-text">SmartDocQ</span>
      </div>
      <nav className="app-header__nav">
        {!isAuthOrHome && (
          <button className="primary-btn" onClick={handleLogout}>Logout</button>
        )}
      </nav>
    </header>
  );
};

export default AppHeader;


