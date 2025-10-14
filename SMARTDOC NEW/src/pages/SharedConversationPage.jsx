import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FiCopy, FiExternalLink } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const SharedConversationPage = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedConversation = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/share/${shareId}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch shared conversation:', err);
        setError(err.response?.data?.error || 'Failed to load shared conversation');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedConversation();
  }, [shareId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="shared-page">
        <div className="grok-bg"></div>
        <div className="grok-sweep"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading shared conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-page">
        <div className="grok-bg"></div>
        <div className="grok-sweep"></div>
        <div className="error-container">
          <h2>⚠️ {error}</h2>
          <button onClick={() => navigate('/')} className="home-btn">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-page">
      <div className="grok-bg"></div>
      <div className="grok-sweep"></div>
      <div className="welcome-orb orb1"></div>
      <div className="welcome-orb orb2"></div>

      <header className="shared-header">
        <div className="shared-brand" onClick={() => navigate('/')}>
          <h1>SmartDocQ</h1>
          <span className="badge">Shared Conversation</span>
        </div>
        <button onClick={() => navigate('/login')} className="login-btn">
          <FiExternalLink /> Sign in to SmartDocQ
        </button>
      </header>

      <div className="shared-container">
        <div className="shared-content">
          <div className="document-info">
            <h2>{data.filename}</h2>
            <p className="doc-date">Shared on {new Date(data.created_at).toLocaleDateString()}</p>
          </div>

          <div className="conversation-view">
            {data.conversation.map((entry, index) => (
              <div key={index} className={`chat-message ${entry.role}`}>
                <div className={`avatar ${entry.role}-avatar`}>
                  {entry.role === 'user' ? 'You' : 'AI'}
                </div>
                <div>
                  <div className="message-content">
                    <ReactMarkdown>{entry.content}</ReactMarkdown>
                    {entry.role === 'assistant' && (
                      <button onClick={() => handleCopy(entry.content)} className="copy-btn" title="Copy">
                        <FiCopy />
                      </button>
                    )}
                  </div>
                  <div className="timestamp">{entry.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .shared-page {
          min-height: 100vh;
          background: #0b0f14;
          position: relative;
        }
        .shared-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1000;
        }
        .shared-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .shared-brand h1 {
          color: #f1f5f9;
          font-size: 24px;
          font-weight: 800;
          margin: 0;
        }
        .badge {
          background: rgba(124, 58, 237, 0.2);
          color: #c4b5fd;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        .login-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(90deg, #7c3aed, #4f46e5);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
        }
        .shared-container {
          padding: 100px 40px 40px;
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .shared-content {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 20px;
          padding: 32px;
          backdrop-filter: blur(8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
        }
        .document-info {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }
        .document-info h2 {
          color: #e5e7eb;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px;
        }
        .doc-date {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }
        .conversation-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .loading-container, .error-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #e5e7eb;
          position: relative;
          z-index: 1;
        }
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(148, 163, 184, 0.2);
          border-top-color: #60a5fa;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .home-btn {
          margin-top: 20px;
          padding: 12px 24px;
          background: linear-gradient(90deg, #7c3aed, #4f46e5);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default SharedConversationPage;
