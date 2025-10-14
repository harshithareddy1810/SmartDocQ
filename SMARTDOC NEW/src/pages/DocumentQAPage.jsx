// src/pages/DocumentQAPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import mammoth from 'mammoth';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


// Set default auth header if token exists
const token = localStorage.getItem('jwt_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}


// PDF Viewer
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;


// Voice + Icons
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FiMic, FiMicOff, FiCopy, FiShare2 } from 'react-icons/fi';
import { BsHandThumbsUp, BsHandThumbsUpFill, BsHandThumbsDown, BsHandThumbsDownFill } from "react-icons/bs";


// Markdown
import ReactMarkdown from 'react-markdown';


import '../index.css';


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';


/** -------- Filled thumbs feedback (👍 / 👎) -------- */
const FeedbackButtons = React.memo(({ messageId }) => {
  const [mine, setMine] = useState(null); // "up" | "down" | null
  const [loading, setLoading] = useState(false);


  const send = async (rating) => {
    if (!messageId || loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      await axios.post(
        `${API_BASE}/api/feedback`,
        { message_id: messageId, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setMine(rating);
    } catch (err) {
      console.error('Feedback failed:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };


  const btn = {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '1.3rem',
    padding: '2px 6px',
  };


  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
      <button onClick={() => send('up')} disabled={loading} style={btn} title="Helpful" aria-label="thumbs up">
        {mine === 'up' ? <BsHandThumbsUpFill color="#22c55e" /> : <BsHandThumbsUp color="#6b7280" />}
      </button>
      <button onClick={() => send('down')} disabled={loading} style={btn} title="Not helpful" aria-label="thumbs down">
        {mine === 'down' ? <BsHandThumbsDownFill color="#ef4444" /> : <BsHandThumbsDown color="#6b7280" />}
      </button>
    </div>
  );
});


/** -------- Memoized PDF pane to avoid re-render on typing -------- */
const PdfPane = React.memo(function PdfPane({
  filename,
  numPages,
  onSetNumPages,
}) {
  const docUrl = useMemo(() => (filename ? `${API_BASE}/uploads/${filename}` : null), [filename]);
  const [loadError, setLoadError] = React.useState(null);


  const onDocumentLoadSuccess = useCallback(
    ({ numPages }) => onSetNumPages(numPages),
    [onSetNumPages]
  );


  if (!filename || !/\.pdf$/i.test(filename)) {
    // Only render the viewer for PDFs; for other formats you could add previews later.
    return <p>No PDF preview available.</p>;
  }


  return (
    <>
      <Document
        key={filename} // reinit only when file changes
        file={{ url: docUrl }}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => { console.error('PDF failed to load:', error); setLoadError(error?.message || String(error)); }}
        loading={<p>Loading PDF...</p>}
        error={<p>Failed to load PDF. Please check backend URL.</p>}
      >
        <div className="pdf-scroll">
          {Array.from({ length: numPages || 0 }, (_, i) => (
            <div key={i + 1} className="pdf-page">
              <Page
                pageNumber={i + 1}
                width={640}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
        </div>
      </Document>
      {loadError && (
        <div style={{ padding: 12, color: '#fca5a5' }}>
          <p>PDF viewer failed: {loadError}</p>
          <p>
            <a href={docUrl} target="_blank" rel="noreferrer" style={{ color: '#93c5fd' }}>Open / download raw PDF</a>
          </p>
          <div style={{ marginTop: 8 }}>
            <iframe src={docUrl} title={filename} style={{ width: '100%', height: '60vh', border: 'none' }} />
          </div>
        </div>
      )}
    </>
  );
}, (prev, next) => {
  // prevent re-render unless the file or current page changes
  return prev.filename === next.filename && prev.numPages === next.numPages;
});


/** -------- DocumentPreview: images, text/docx, pdf fallback -------- */
const DocumentPreview = React.memo(function DocumentPreview({ doc, numPages, onSetNumPages }) {
  const filename = doc?.filename || "";
  const lower = filename.toLowerCase();
  const docUrl = filename ? `${API_BASE}/uploads/${filename}` : null;

  // Image types
  if (lower.match(/\.(png|jpe?g|gif|bmp|tiff|webp)$/)) {
    return (
      <div className="image-preview" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img
          src={docUrl}
          alt={filename}
          style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)', objectFit: 'contain', borderRadius: 8 }}
          onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
        />
      </div>
    );
  }

  // PDF -> reuse PdfPane
  if (lower.endsWith('.pdf')) {
    // Use a simple iframe fallback for reliability across browsers/dev setups.
    if (!docUrl) return <p>No PDF URL available.</p>;
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <iframe src={docUrl} title={filename} style={{ width: '100%', height: 'calc(100vh - 180px)', border: 'none' }} />
        <div style={{ padding: 8 }}>
          <a href={docUrl} target="_blank" rel="noreferrer" style={{ color: '#93c5fd' }}>Open raw PDF in new tab</a>
        </div>
      </div>
    );
    // If needed, PdfPane can be used instead of iframe for advanced rendering:
    // return <PdfPane filename={filename} numPages={numPages} onSetNumPages={onSetNumPages} />;
  }

  // DOCX: fetch binary and convert to HTML (preserve formatting)
  if (lower.endsWith('.docx')) {
    const [html, setHtml] = React.useState(null);
    const [loadingHtml, setLoadingHtml] = React.useState(false);
    useEffect(() => {
      let mounted = true;
      if (!docUrl) return;
      setLoadingHtml(true);
      (async () => {
        try {
          const res = await fetch(docUrl);
          const arrayBuffer = await res.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          if (!mounted) return;
          setHtml(result?.value || '<div>No content</div>');
        } catch (e) {
          console.error('Failed to load/convert docx:', e);
          if (mounted) setHtml('<pre style="white-space:pre-wrap;">Failed to render document.</pre>');
        } finally {
          if (mounted) setLoadingHtml(false);
        }
      })();
      return () => { mounted = false; };
    }, [docUrl]);

    if (loadingHtml && !html) return <div style={{ padding: 18, color: '#cbd5e1' }}>Rendering document...</div>;
    return (
      <div className="docx-preview" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)', padding: 12 }}>
        <div dangerouslySetInnerHTML={{ __html: html || '<div>No content</div>' }} />
      </div>
    );
  }

  // Text formats (server extracts text for txt) - render plain text
  if (lower.endsWith('.txt') || doc?.text) {
    const text = doc?.text || 'No preview available for this document.';
    return (
      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)', padding: 12 }}>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', color: '#e5e7eb' }}>{text}</pre>
      </div>
    );
  }

  // Other / unknown types: show download link
  if (filename) {
    return (
      <div style={{ padding: 18, color: '#cbd5e1' }}>
        <p>No preview available for this file type.</p>
        <a href={docUrl} target="_blank" rel="noreferrer" style={{ color: '#93c5fd' }}>Open / download {filename}</a>
      </div>
    );
  }

  return <p>No preview available.</p>;
}, (prev, next) => prev.doc?.filename === next.doc?.filename && prev.doc?.text === next.doc?.text);


const DocumentQAPage = () => {
  const navigate = useNavigate();
  const { docId } = useParams();

  // Document state
  const [doc, setDoc] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Chat state
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [conversation, setConversation] = useState([]); // { role, content, time, message_id? }
  const [isLoading, setIsLoading] = useState(false);

  // Voice
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  useEffect(() => {
    setCurrentQuestion(transcript);
  }, [transcript]);
  const [isStandardMicActive, setIsStandardMicActive] = useState(false);

  // General Assistant popup state
  const [showAssistantPopup, setShowAssistantPopup] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantConversation, setAssistantConversation] = useState([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);


  const tokenGuard = useCallback(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return null;
    }
    // Ensure Authorization header is set
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return token;
  }, [navigate]);


  // Fetch document & conversation
  const fetchData = useCallback(async () => {
    const token = tokenGuard();
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE}/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoc(response.data);
      setConversation(response.data.conversation || []);
      setNumPages(null);  // reset until the Document loads and sets it
      setPageNumber(1);   // go to first page for new document
    } catch (error) {
      console.error("Failed to fetch document details:", error?.response?.data || error.message);
    }
  }, [docId, tokenGuard]);


  // Verify token validity immediately and set up automatic checks
  const { isAuthenticated } = useAuth();


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate, fetchData]);


  const onSetNumPages = useCallback((n) => setNumPages(n), []);
  const onPrevPage = useCallback(() => setPageNumber(p => Math.max(1, p - 1)), []);
  const onNextPage = useCallback(() => setPageNumber(p => (numPages ? Math.min(numPages, p + 1) : p + 1)), [numPages]);


  const handleAskQuestion = useCallback(async (e) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isLoading || !doc) return;
    const token = tokenGuard();
    if (!token) return;


    const newQuestion = currentQuestion;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


    // Optimistic user message
    setConversation(prev => [...prev, { role: 'user', content: newQuestion, time: timestamp }]);
    setCurrentQuestion("");
    resetTranscript();
    setIsLoading(true);


    try {
      const res = await axios.post(
        `${API_BASE}/api/ask`,
        { question: newQuestion, doc_id: Number(docId) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );


      const answer = res?.data?.answer ?? ' ';
      const messageId = res?.data?.message_id;
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


      // Append assistant message with message_id (so feedback appears)
      setConversation(prev => [
        ...prev,
        { role: 'assistant', content: answer, time: aiTimestamp, message_id: messageId }
      ]);
    } catch (error) {
      console.error("Error fetching answer:", error?.response?.data || error.message);
      const backendMessage = error?.response?.data?.error || error?.response?.data?.message;
      const errorText = backendMessage || 'Sorry, I ran into an error.';
      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          content: errorText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, isLoading, doc, tokenGuard, docId, resetTranscript]);


  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }, []);

  // Toggle assistant popup
  const handleAssistantClick = useCallback(() => {
    setShowAssistantPopup(prev => !prev);
  }, []);


  // Handle general assistant question (no document context)
  const handleAssistantAsk = useCallback(async (e) => {
    e.preventDefault();
    if (!assistantQuestion.trim() || assistantLoading) return;
    const token = tokenGuard();
    if (!token) return;

    const newQ = assistantQuestion;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAssistantConversation(prev => [...prev, { role: 'user', content: newQ, time: timestamp }]);
    setAssistantQuestion('');
    setAssistantLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/general-ask`,
        { question: newQ },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      const answer = res?.data?.answer || 'No response';
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAssistantConversation(prev => [...prev, { role: 'assistant', content: answer, time: aiTime }]);
    } catch (err) {
      console.error('General assistant error:', err);
      setAssistantConversation(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setAssistantLoading(false);
    }
  }, [assistantQuestion, assistantLoading, tokenGuard]);


  const handleCopyAssistant = useCallback((text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }, []);


  const handleShare = useCallback(async () => {
    const token = tokenGuard();
    if (!token || !docId) return;

    try {
      const res = await axios.post(
        `${API_BASE}/api/share`,
        { doc_id: Number(docId) },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      setShareUrl(res.data.share_url);
      setShowShareModal(true);
    } catch (err) {
      console.error('Share failed:', err);
      alert('Failed to create share link: ' + (err.response?.data?.error || err.message));
    }
  }, [docId, tokenGuard]);

  const copyShareLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  }, [shareUrl]);


  return (
    <div className="qa-page-layout" style={{ position: 'relative' }}>
      {/* Background to match site theme */}
      <div className="grok-bg"></div>
      <div className="grok-sweep"></div>
      <div className="welcome-orb orb1"></div>
      <div className="welcome-orb orb2"></div>
      <div className="grok-title" style={{ left:'42%', top:'56%', fontSize:'clamp(48px,11vw,150px)', color:'rgba(226,232,240,0.06)', zIndex:-1 }}>SmartDocQ</div>

      <main className="qa-container">
        <div className="qa-left pdf-viewer">
          {doc ? (
            <DocumentPreview doc={doc} numPages={numPages} onSetNumPages={onSetNumPages} />
          ) : (
            <p>Loading document...</p>
          )}
        </div>


        <div className="qa-right">
          <div className="qa-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <div style={{ color:'#e5e7eb', fontWeight:700, fontSize:16 }}>Ask your document</div>
              <div style={{ color:'#94a3b8', fontSize:12 }}>{doc?.filename || 'Loading…'}</div>
            </div>
            <button
              onClick={handleShare}
              className="share-btn"
              title="Share conversation"
              style={{
                background: 'rgba(148, 163, 184, 0.12)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#e5e7eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <FiShare2 size={16} /> Share
            </button>
          </div>


          <div className="qa-history">
            {conversation.map((entry, index) => (
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


                  {/* Filled thumbs only for assistant messages WHEN message_id exists */}
                  {entry.role === 'assistant' && entry.message_id ? (
                    <FeedbackButtons messageId={entry.message_id} />
                  ) : null}


                  <div className="timestamp">{entry.time}</div>
                </div>
              </div>
            ))}


            {isLoading && (
              <div className="chat-message assistant">
                <div className="avatar assistant-avatar">AI</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>


          <form className="qa-input-section" onSubmit={handleAskQuestion}>
            <input
              type="text"
              placeholder="Type or speak your question..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              disabled={isLoading}
            />
            {browserSupportsSpeechRecognition && (
              <button
                type="button"
                onClick={() => {
                  if (listening) {
                    SpeechRecognition.stopListening();
                    setIsStandardMicActive(false);
                  } else {
                    setIsStandardMicActive(true);
                    resetTranscript();
                      SpeechRecognition.startListening({
                        continuous: true,
                        interimResults: true,
                        language: 'en-US',
                      });
                  }
                }}
                className="mic-btn"
                style={{ backgroundColor: listening ? '#ef4444' : '#6b21a8' }}
                title={listening ? "Stop listening" : "Start listening"}
              >
                {listening ? <FiMicOff /> : <FiMic />}
              </button>
            )}
            <button
              type="button"
              className="google-assistant-btn"
              title="Open AI Assistant"
              onClick={handleAssistantClick}
              disabled={isLoading}
              style={{
                background: showAssistantPopup ? '#4285f4' : 'transparent',
                border: showAssistantPopup ? '2px solid #4285f4' : '2px solid transparent',
                borderRadius: '50%',
                cursor: 'pointer',
                marginRight: 8,
                alignSelf: 'center',
                padding: 8,
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
                {/* inline project logo SVG (larger; transforms removed so it scales to the button) */}
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 256 256"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="SmartDocQ logo"
                  style={{
                    width: 28,
                    height: 28,
                    display: 'block',
                    filter: showAssistantPopup ? 'brightness(0) invert(1)' : 'none'
                  }}
                >
                  <defs>
                    <linearGradient id="miniG_assist" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  {/* head */}
                  <circle cx="128" cy="72" r="44" fill="#bcd7ff" />
                  {/* visor */}
                  <rect x="84" y="52" width="88" height="40" rx="20" fill="#0b1220" />
                  {/* eyes */}
                  <circle cx="108" cy="72" r="6" fill="#60a5fa" />
                  <circle cx="148" cy="72" r="6" fill="#60a5fa" />
                  {/* body */}
                  <rect x="96" y="120" width="64" height="42" rx="12" fill="#bcd7ff" />
                  <rect x="112" y="130" width="32" height="22" rx="10" fill="url(#miniG_assist)" />
                </svg>
             </button>
            <button type="submit" className="qa-send-btn" disabled={isLoading}>➤</button>
          </form>
        </div>
      </main>

      {/* Assistant Popup Chat */}
      {showAssistantPopup && (
        <div className={`assistant-popup ${isMinimized ? 'minimized' : ''}`}>
          <div className="assistant-popup-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="popupG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <circle cx="128" cy="72" r="44" fill="#bcd7ff" />
                <rect x="84" y="52" width="88" height="40" rx="20" fill="#0b1220" />
                <circle cx="108" cy="72" r="6" fill="#60a5fa" />
                <circle cx="148" cy="72" r="6" fill="#60a5fa" />
                <rect x="96" y="120" width="64" height="42" rx="12" fill="#bcd7ff" />
                <rect x="112" y="130" width="32" height="22" rx="10" fill="url(#popupG)" />
              </svg>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>AI Assistant</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Ask me anything</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="popup-control-btn"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? '□' : '−'}
              </button>
              <button
                onClick={() => setShowAssistantPopup(false)}
                className="popup-control-btn"
                title="Close"
              >×</button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="assistant-popup-body">
                {assistantConversation.length === 0 ? (
                  <div className="assistant-welcome">
                    <div className="welcome-icon">
                      <svg width="48" height="48" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="welcomeG" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#22d3ee" />
                          </linearGradient>
                        </defs>
                        <circle cx="128" cy="72" r="44" fill="#bcd7ff" />
                        <rect x="84" y="52" width="88" height="40" rx="20" fill="#0b1220" />
                        <circle cx="108" cy="72" r="6" fill="#60a5fa" />
                        <circle cx="148" cy="72" r="6" fill="#60a5fa" />
                        <rect x="96" y="120" width="64" height="42" rx="12" fill="#bcd7ff" />
                        <rect x="112" y="130" width="32" height="22" rx="10" fill="url(#welcomeG)" />
                      </svg>
                    </div>
                    <h3 style={{ color: '#e5e7eb', fontSize: 16, fontWeight: 600, marginTop: 16 }}>👋 Hi! I'm your AI Assistant</h3>
                    <p style={{ fontSize: 13, marginTop: 8, color: '#94a3b8', lineHeight: 1.5 }}>
                      I can help with general questions, explanations, coding problems, and more!
                    </p>
                    <div className="suggestion-chips">
                      <button 
                        className="chip"
                        onClick={() => setAssistantQuestion("What is React?")}
                      >
                        💡 What is React?
                      </button>
                      <button 
                        className="chip"
                        onClick={() => setAssistantQuestion("Explain machine learning")}
                      >
                        🤖 Explain ML
                      </button>
                      <button 
                        className="chip"
                        onClick={() => setAssistantQuestion("Write a Python function")}
                      >
                        🐍 Python help
                      </button>
                    </div>
                  </div>
                ) : (
                  assistantConversation.map((msg, idx) => (
                    <div key={idx} className={`popup-chat-message ${msg.role}`}>
                      <div className={`popup-avatar ${msg.role}-avatar`}>
                        {msg.role === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className="popup-message-wrapper">
                        <div className="popup-message-content">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          {msg.role === 'assistant' && (
                            <button 
                              onClick={() => handleCopyAssistant(msg.content)} 
                              className="popup-copy-btn" 
                              title="Copy"
                            >
                              <FiCopy />
                            </button>
                          )}
                        </div>
                        <div className="popup-timestamp">{msg.time}</div>
                      </div>
                    </div>
                  ))
                )}
                {assistantLoading && (
                  <div className="popup-chat-message assistant">
                    <div className="popup-avatar assistant-avatar">🤖</div>
                    <div className="popup-message-wrapper">
                      <div className="popup-message-content">
                        <div className="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form className="assistant-popup-input" onSubmit={handleAssistantAsk}>
                <div className="popup-input-wrapper">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={assistantQuestion}
                    onChange={(e) => setAssistantQuestion(e.target.value)}
                    disabled={assistantLoading}
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    disabled={assistantLoading || !assistantQuestion.trim()}
                    className="popup-send-btn"
                  >
                    {assistantLoading ? '⏳' : '➤'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Share Conversation</h3>
            <p>Anyone with this link can view this conversation:</p>
            <div className="share-link-container">
              <input type="text" value={shareUrl} readOnly />
              <button onClick={copyShareLink} className="copy-link-btn">
                <FiCopy /> Copy
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)} className="close-modal-btn">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Scoped styling for professional dark-glass chat UI */}
      <style>{`
        .qa-page-layout { min-height: 100vh; display:flex; position:relative; background:#0b0f14; }
        .qa-container { width:100%; display:flex; gap: 28px; padding: 60px 70px; position:relative; z-index:1; }
        .qa-left { flex: 1; overflow: auto; display:flex; flex-direction: column; background: rgba(15,23,42,0.80); border:1px solid rgba(148,163,184,0.20); border-radius: 18px; backdrop-filter: blur(8px); box-shadow: 0 16px 36px rgba(0,0,0,0.35); padding: 14px; }
        .qa-right { width: 42%; display:flex; flex-direction: column; background: rgba(15,23,42,0.80); border:1px solid rgba(148,163,184,0.20); border-radius: 18px; backdrop-filter: blur(8px); box-shadow: 0 16px 36px rgba(0,0,0,0.35); padding: 16px; }
        .qa-history { flex:1; overflow-y:auto; padding: 8px; display:flex; flex-direction: column; gap: 14px; }
        .chat-message { display:flex; gap:10px; max-width: 92%; }
        .chat-message.user { align-self: flex-end; flex-direction: row-reverse; }
        .avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0; font-size: 11px; }
        .avatar.user-avatar { background:#4f46e5; color:#fff; }
        .avatar.assistant-avatar { background:#f3f4f6; color:#374151; }
        .message-content { position:relative; padding: 12px 16px; border-radius:14px; background: rgba(11,15,20,0.78); color:#e5e7eb; border:1px solid rgba(148,163,184,0.22); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .chat-message.user .message-content { background: #0b1220; color:#e5e7eb; border:1px solid rgba(148,163,184,0.22); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .timestamp { font-size: 0.75rem; color:#94a3b8; margin-top:6px; }
        .copy-btn { position:absolute; top:8px; right:8px; background: rgba(0,0,0,0.15); border:none; color:#cbd5e1; cursor:pointer; border-radius:6px; padding:4px; display:flex; opacity:0; transition:opacity .2s; }
        .message-content:hover .copy-btn { opacity:1; }
        .qa-input-section { margin-top: 12px; display:flex; gap:10px; align-items:center; }
        .qa-input-section input { flex:1; padding: 12px 14px; border-radius: 12px; border:1px solid rgba(148,163,184,0.28); background: #0b1220; color:#e5e7eb; box-shadow: inset 0 1px 0 rgba(255,255,255,0.02); }
        .qa-send-btn { background: linear-gradient(90deg,#7c3aed,#4f46e5); color:#fff; border:none; padding: 0 16px; height: 44px; border-radius: 12px; cursor:pointer; box-shadow: 0 12px 32px rgba(17,24,39,0.45); }
        .mic-btn { height:42px; padding: 0 12px; border-radius:10px; border:1px solid rgba(148,163,184,0.25); background: rgba(148,163,184,0.10); color:#e5e7eb; }
        .qa-header { background: rgba(15,23,42,0.85); border:1px solid rgba(148,163,184,0.20); border-radius: 12px; padding: 10px 12px; backdrop-filter: blur(8px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .pdf-viewer { padding: 0; min-height: 0; }
        .pdf-scroll { overflow-y: auto; padding-right: 8px; max-height: calc(100vh - 160px); }
        .pdf-page { display:flex; justify-content:center; margin-bottom: 18px; }
        .docx-preview { color: #e5e7eb; }
        .docx-preview p { color: #e5e7eb; margin-bottom: 0.9rem; line-height: 1.6; }
        .docx-preview h1, .docx-preview h2, .docx-preview h3 { color: #fff; margin: 0.6rem 0; }
        .docx-preview a { color: #60a5fa; text-decoration: underline; }
        .docx-preview ul, .docx-preview ol { margin-left: 1.2rem; margin-bottom: 0.9rem; }
        .docx-preview img { max-width: 100%; height: auto; display:block; margin: 12px 0; }

        /* Enhanced Assistant Popup Styles */
        .assistant-popup {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 420px;
          max-height: 600px;
          height: 600px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 16px;
          backdrop-filter: blur(16px);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(148, 163, 184, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          animation: slideUp 0.3s ease;
          transition: height 0.3s ease, max-height 0.3s ease;
        }
        .assistant-popup.minimized {
          height: 60px;
          max-height: 60px;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .assistant-popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.25);
          color: #e5e7eb;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 16px 16px 0 0;
          flex-shrink: 0;
        }
        .popup-control-btn {
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 6px 10px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .popup-control-btn:hover {
          background: rgba(148, 163, 184, 0.2);
          border-color: rgba(148, 163, 184, 0.3);
        }
        .assistant-popup-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .assistant-welcome {
          text-align: center;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        .welcome-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .suggestion-chips {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 20px;
          width: 100%;
        }
        .chip {
          background: rgba(148, 163, 184, 0.12);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
          text-align: left;
        }
        .chip:hover {
          background: rgba(148, 163, 184, 0.18);
          border-color: rgba(148, 163, 184, 0.3);
          transform: translateX(4px);
        }
        .popup-chat-message {
          display: flex;
          gap: 10px;
          max-width: 100%;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .popup-chat-message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .popup-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          background: rgba(148, 163, 184, 0.15);
        }
        .popup-avatar.user-avatar {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
        }
        .popup-avatar.assistant-avatar {
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
        }
        .popup-message-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .popup-message-content {
          position: relative;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(11, 15, 20, 0.85);
          color: #e5e7eb;
          border: 1px solid rgba(148, 163, 184, 0.25);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          word-wrap: break-word;
          line-height: 1.5;
        }
        .popup-chat-message.user .popup-message-content {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.3), rgba(124, 58, 237, 0.3));
          border-color: rgba(124, 58, 237, 0.4);
        }
        .popup-timestamp {
          font-size: 0.7rem;
          color: #6b7280;
          margin-top: 4px;
          padding: 0 4px;
        }
        .popup-copy-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
          cursor: pointer;
          border-radius: 6px;
          padding: 4px;
          display: flex;
          opacity: 0;
          transition: opacity 0.2s, background 0.2s;
        }
        .popup-message-content:hover .popup-copy-btn {
          opacity: 1;
        }
        .popup-copy-btn:hover {
          background: rgba(0, 0, 0, 0.4);
        }
        .assistant-popup-input {
          display: flex;
          padding: 16px;
          border-top: 1px solid rgba(148, 163, 184, 0.25);
          background: rgba(15, 23, 42, 0.6);
          border-radius: 0 0 16px 16px;
          flex-shrink: 0;
        }
        .popup-input-wrapper {
          display: flex;
          gap: 8px;
          width: 100%;
          background: rgba(11, 15, 20, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 12px;
          padding: 4px;
          transition: border-color 0.2s;
        }
        .popup-input-wrapper:focus-within {
          border-color: #4285f4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
        }
        .assistant-popup-input input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #e5e7eb;
          font-size: 14px;
        }
        .assistant-popup-input input:focus {
          outline: none;
        }
        .assistant-popup-input input::placeholder {
          color: #6b7280;
        }
        .popup-send-btn {
          background: linear-gradient(90deg, #7c3aed, #4f46e5);
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: opacity 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 50px;
        }
        .popup-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .popup-send-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* Modal styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.2s ease;
        }
        
        .share-modal {
          background: rgba(15, 23, 42, 0.98);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 16px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
          animation: slideUp 0.3s ease;
        }
        
        .share-modal h3 {
          color: #e5e7eb;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 12px;
        }
        
        .share-modal p {
          color: #94a3b8;
          margin: 0 0 20px;
          line-height: 1.5;
        }
        
        .share-link-container {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .share-link-container input {
          flex: 1;
          padding: 10px 14px;
          background: rgba(2, 6, 23, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          color: #e5e7eb;
          font-size: 14px;
        }
        
        .copy-link-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: linear-gradient(90deg, #7c3aed, #4f46e5);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .copy-link-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
        }
        
        .close-modal-btn {
          width: 100%;
          padding: 10px;
          background: rgba(148, 163, 184, 0.12);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: #cbd5e1;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .close-modal-btn:hover {
          background: rgba(148, 163, 184, 0.18);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DocumentQAPage;