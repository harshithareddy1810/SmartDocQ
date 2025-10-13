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
import { FiMic, FiMicOff, FiCopy } from 'react-icons/fi';
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

  // Google Assistant state
  const [isGoogleAssistantActive, setIsGoogleAssistantActive] = useState(false);
  const [googleAssistantListening, setGoogleAssistantListening] = useState(false);


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

  // Google Assistant functionality
  const handleGoogleAssistantClick = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (googleAssistantListening) {
      // Stop listening
      SpeechRecognition.stopListening();
      setGoogleAssistantListening(false);
      setIsGoogleAssistantActive(false);
    } else {
      // Start listening
      setIsGoogleAssistantActive(true);
      setGoogleAssistantListening(true);
      setIsStandardMicActive(false);
      
      // Start speech recognition
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
        language: 'en-US',
      });
    }
  }, [browserSupportsSpeechRecognition, googleAssistantListening]);

  // Standard mic button behavior is handled inline on the button now

  // Handle Google Assistant speech recognition
  useEffect(() => {
    if (isGoogleAssistantActive && transcript && !listening) {
      // Speech recognition completed, process the question
      setCurrentQuestion(transcript);
      setGoogleAssistantListening(false);
      setIsGoogleAssistantActive(false);
      
      // Automatically submit the question
      setTimeout(() => {
        if (transcript.trim()) {
          handleAskQuestion({ preventDefault: () => {} });
        }
      }, 500);
    }
  }, [transcript, listening, isGoogleAssistantActive, handleAskQuestion]);

  // Auto-submit for standard mic capture
  useEffect(() => {
    if (isStandardMicActive && transcript && !listening) {
      setCurrentQuestion(transcript);
      setIsStandardMicActive(false);
      setTimeout(() => {
        if (transcript.trim()) {
          handleAskQuestion({ preventDefault: () => {} });
        }
      }, 300);
    }
  }, [isStandardMicActive, transcript, listening, handleAskQuestion]);

  // If recognition ends immediately, auto-retry while standard mic is active
  useEffect(() => {
    if (isStandardMicActive && !listening && browserSupportsSpeechRecognition) {
      // Small delay prevents tight loops if permission is pending/denied
      const id = setTimeout(() => {
        SpeechRecognition.startListening({
          continuous: true,
          interimResults: true,
          language: 'en-US',
        });
      }, 250);
      return () => clearTimeout(id);
    }
  }, [isStandardMicActive, listening, browserSupportsSpeechRecognition]);

  // Text-to-speech for Google Assistant responses
  const speakResponse = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Auto-speak the latest assistant response
  useEffect(() => {
    if (conversation.length > 0) {
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage.role === 'assistant' && isGoogleAssistantActive) {
        // Speak the response after a short delay
        setTimeout(() => {
          speakResponse(lastMessage.content);
        }, 1000);
      }
    }
  }, [conversation, isGoogleAssistantActive, speakResponse]);


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

            {googleAssistantListening && (
              <div className="chat-message assistant">
                <div className="avatar assistant-avatar">🎤</div>
                <div className="message-content">
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: '#4285f4',
                    fontStyle: 'italic'
                  }}>
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                    {transcript ? `"${transcript}"` : 'Google Assistant is listening...'}
                  </div>
                </div>
              </div>
            )}
            {/* Standard mic listening preview */}
            {isStandardMicActive && listening && (
              <div className="chat-message assistant">
                <div className="avatar assistant-avatar">🎤</div>
                <div className="message-content">
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: '#93c5fd',
                    fontStyle: 'italic'
                  }}>
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                    {transcript ? `"${transcript}"` : 'Listening...'}
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
                    setIsGoogleAssistantActive(false);
                    setGoogleAssistantListening(false);
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
            {/* Google Assistant button added here */}
            <button
              type="button"
              className="google-assistant-btn"
              title={googleAssistantListening ? "Stop Google Assistant" : "Start Google Assistant"}
              onClick={handleGoogleAssistantClick}
              disabled={isLoading}
              style={{
                background: googleAssistantListening ? '#4285f4' : 'transparent',
                border: googleAssistantListening ? '2px solid #4285f4' : '2px solid transparent',
                borderRadius: '50%',
                cursor: 'pointer',
                marginRight: 8,
                alignSelf: 'center',
                padding: '4px',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
                <img
                  src="/Google_assistant_logo.svg"
                  alt="Google Assistant"
                style={{ 
                  width: 24, 
                  height: 24,
                  filter: googleAssistantListening ? 'brightness(0) invert(1)' : 'none'
                }}
              />
            </button>
            <button type="submit" className="qa-send-btn" disabled={isLoading}>➤</button>
          </form>
        </div>
      </main>

      {/* Scoped styling for professional dark-glass chat UI */}
      <style>{`
        .qa-page-layout { min-height: 100vh; display:flex; position:relative; background:#0b0f14; }
        .qa-container { width:100%; display:flex; gap: 28px; padding: 60px 70px; position:relative; z-index:1; }
        /* Neat glass containers matching site theme */
  .qa-left { flex: 1; overflow: auto; display:flex; flex-direction: column; background: rgba(15,23,42,0.80); border:1px solid rgba(148,163,184,0.20); border-radius: 18px; backdrop-filter: blur(8px); box-shadow: 0 16px 36px rgba(0,0,0,0.35); padding: 14px; }
        .qa-right { width: 42%; display:flex; flex-direction: column; background: rgba(15,23,42,0.80); border:1px solid rgba(148,163,184,0.20); border-radius: 18px; backdrop-filter: blur(8px); box-shadow: 0 16px 36px rgba(0,0,0,0.35); padding: 16px; }
        .qa-history { flex:1; overflow-y:auto; padding: 8px; display:flex; flex-direction: column; gap: 14px; }
        .chat-message { display:flex; gap:10px; max-width: 92%; }
        .chat-message.user { align-self: flex-end; flex-direction: row-reverse; }
        .avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0; }
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
  /* DOCX preview styling (mammoth output) */
  .docx-preview { color: #e5e7eb; }
  .docx-preview p { color: #e5e7eb; margin-bottom: 0.9rem; line-height: 1.6; }
  .docx-preview h1, .docx-preview h2, .docx-preview h3 { color: #fff; margin: 0.6rem 0; }
  .docx-preview a { color: #60a5fa; text-decoration: underline; }
  .docx-preview ul, .docx-preview ol { margin-left: 1.2rem; margin-bottom: 0.9rem; }
  .docx-preview img { max-width: 100%; height: auto; display:block; margin: 12px 0; }
        @media (max-width: 1024px) {
          .qa-right { width: 100%; }
          .qa-container { flex-direction: column; padding: 40px 22px; gap: 16px; }
        }
      `}</style>
    </div>
  );
};


export default DocumentQAPage;
// hi