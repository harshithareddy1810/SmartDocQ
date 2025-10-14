// src/pages/UploadPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUpload, FiFileText, FiFile, FiFilePlus, FiImage, FiLink, FiEdit3, FiChevronDown } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const UploadPage = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("Choose a file...");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // hidden file inputs
  const pdfInputRef = useRef(null);
  const wordInputRef = useRef(null);
  const textInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Ensure page remains scrollable
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = '';
    return () => { document.body.style.overflow = previousOverflow || ''; };
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file type
      const allowedExtensions = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.webp'];
      const fileName = file.name.toLowerCase();
      const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isAllowed) {
        alert('Unsupported file type. Please upload: PDF, DOCX, TXT, PNG, JPG, JPEG, TIFF, BMP, or WEBP files.');
        return;
      }
      
      setFileName(file.name);
      uploadFile(file);
    }
  };

  const tokenGuard = () => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      alert("You must be logged in to upload documents.");
      // Do not auto-redirect; allow user to choose navigation
      return null;
    }
    return token;
  };

  /** Upload file (pdf/docx/txt/image) */
  const uploadFile = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    const token = tokenGuard();
    if (!token) return;

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await axios.post(`${API_BASE}/api/documents`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      const { doc_id } = res.data || {};
      if (!doc_id) {
        alert("Upload succeeded but server did not return document id.");
        return;
      }
      navigate(`/qa/${doc_id}`);
    } catch (err) {
      console.error("File upload failed:", err);
      // Do not auto-redirect on transient auth/network issues
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    await uploadFile(file);
    // reset the input so re-uploading the same file triggers onChange
    event.target.value = "";
  };

  /** Import a web page by URL (JSON to same endpoint) */
  const handleImportUrl = async () => {
    const token = tokenGuard();
    if (!token) return;

    const url = window.prompt("Paste the web page URL to import:");
    if (!url) return;

    try {
      const res = await axios.post(
        `${API_BASE}/api/documents`,
        { url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const { doc_id } = res.data || {};
      if (!doc_id) {
        alert("Import succeeded but no document id returned.");
        return;
      }
      navigate(`/qa/${doc_id}`);
    } catch (err) {
      console.error("URL import failed:", err);
      alert("URL import failed: " + (err.response?.data?.error || err.message));
    }
  };

  /** Create a note (JSON to same endpoint) */
  const handleCreateNote = async () => {
    const token = tokenGuard();
    if (!token) return;

    const note = window.prompt("Type (or paste) your note text:");
    if (!note) return;

    try {
      const res = await axios.post(
        `${API_BASE}/api/documents`,
        { note },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const { doc_id } = res.data || {};
      if (!doc_id) {
        alert("Save succeeded but no document id returned.");
        return;
      }
      navigate(`/qa/${doc_id}`);
    } catch (err) {
      console.error("Note save failed:", err);
      alert("Note save failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="upload-page">
      {/* Reuse welcome page animated background for visual consistency */}
      <div className="grok-bg"></div>
      <div className="grok-sweep"></div>
      <div className="welcome-orb orb1"></div>
      <div className="welcome-orb orb2"></div>
      {/* Top Navigation */}
      <div className="upload-header">
        <div className="header-brand">
          <div className="brand-logo">SmartDocQ</div>
          <div className="brand-tagline">AI-Powered Document Intelligence</div>
        </div>
        <div className="header-actions">
          <button className="view-docs-btn" onClick={() => navigate("/documents")}>
            <FiFileText size={16} />
            View Documents
          </button>
          <button className="logout-btn" onClick={() => { localStorage.clear(); navigate("/login"); }}>
          Logout
        </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="upload-container">
        <div className="upload-content">
          <div className="upload-hero">
            <h1 className="upload-title">Upload Your Documents</h1>
            <p className="upload-subtitle">
              Drag and drop your files or choose from the options below. 
              SmartDocQ supports PDFs, Word documents, text files, and images with OCR.
            </p>
          </div>

          {/* Drag and Drop Zone */}
          <div 
            className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              // Open file picker with all supported types instead of just PDF
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.docx,.txt,.png,.jpg,.jpeg,.tiff,.bmp,.webp';
              input.onchange = handleFileUpload;
              input.click();
            }}
          >
            {isUploading ? (
              <div className="upload-progress">
                <div className="progress-icon">
                  <FiUpload size={32} />
                </div>
                <div className="progress-text">Uploading {fileName}...</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <div className="progress-percentage">{uploadProgress}%</div>
              </div>
            ) : (
              <div className="upload-prompt">
                <div className="upload-icon">
                  <FiUpload size={48} />
                </div>
                <div className="upload-text">
                  <div className="upload-main-text">
                    {isDragOver ? 'Drop your file here' : 'Drag & drop your file here'}
                  </div>
                  <div className="upload-sub-text">
                    or <span className="upload-link">browse files</span>
                  </div>
                </div>
                <div className="upload-formats">
                  Supports: PDF, DOCX, TXT, PNG, JPG, JPEG
                </div>
              </div>
            )}
          </div>

          {/* Upload Options */}
          <div className="upload-options">
            <div className="options-title">Or choose a specific option:</div>
            <div className="options-grid">
              <div className="option-card" onClick={() => pdfInputRef.current.click()}>
                <div className="option-icon">
                  <FiFile size={24} />
                </div>
                <div className="option-content">
                  <div className="option-title">PDF Document</div>
                  <div className="option-desc">Upload PDF files for analysis</div>
                </div>
              </div>

              <div className="option-card" onClick={() => wordInputRef.current.click()}>
                <div className="option-icon">
                  <FiFileText size={24} />
                </div>
                <div className="option-content">
                  <div className="option-title">Word Document</div>
                  <div className="option-desc">Upload .docx files</div>
                </div>
              </div>

              <div className="option-card" onClick={() => textInputRef.current.click()}>
                <div className="option-icon">
                  <FiFilePlus size={24} />
                </div>
                <div className="option-content">
                  <div className="option-title">Text File</div>
                  <div className="option-desc">Upload .txt files</div>
                </div>
              </div>

              <div className="option-card" onClick={() => imageInputRef.current.click()}>
                <div className="option-icon">
                  <FiImage size={24} />
                </div>
                <div className="option-content">
                  <div className="option-title">Image (OCR)</div>
                  <div className="option-desc">Extract text from images</div>
                </div>
              </div>

              <div className="option-card" onClick={handleImportUrl}>
                <div className="option-icon">
                  <FiLink size={24} />
                </div>
                <div className="option-content">
                  <div className="option-title">Web Page</div>
                  <div className="option-desc">Import from URL</div>
            </div>
            </div>

              <div className="option-card" onClick={handleCreateNote}>
                <div className="option-icon">
                  <FiEdit3 size={24} />
            </div>
                <div className="option-content">
                  <div className="option-title">Create Note</div>
                  <div className="option-desc">Type or paste text</div>
            </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden inputs - update PDF input to accept all types for drag-drop fallback */}
      <input 
        type="file" 
        ref={pdfInputRef} 
        style={{ display: "none" }} 
        accept=".pdf" 
        onChange={handleFileUpload} 
      />
      <input type="file" ref={wordInputRef} style={{ display: "none" }} accept=".docx" onChange={handleFileUpload} />
      <input type="file" ref={textInputRef} style={{ display: "none" }} accept=".txt" onChange={handleFileUpload} />
      <input type="file" ref={imageInputRef} style={{ display: "none" }} accept=".png,.jpg,.jpeg,.tiff,.bmp,.webp" onChange={handleFileUpload} />

      {/* Styles */}
      <style>{`
        .upload-page {
          min-height: 100vh;
          background: #0b0f14;
          position: relative;
          overflow: visible;
        }

        .upload-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }

        .upload-header {
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

        .header-brand {
          display: flex;
          flex-direction: column;
        }

        .brand-logo {
          font-size: 24px;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.5px;
        }

        .brand-tagline {
          font-size: 12px;
          color: #94a3b8;
          margin-top: -2px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .view-docs-btn, .logout-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .view-docs-btn {
          background: rgba(148, 163, 184, 0.12);
          color: #e5e7eb;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .view-docs-btn:hover {
          background: rgba(148, 163, 184, 0.18);
          transform: translateY(-1px);
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.15);
          color: #fecaca;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.22);
        }

        .upload-container {
          padding: 120px 32px 60px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .upload-content {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .upload-hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .upload-title {
          font-size: 42px;
          font-weight: 800;
          color: #e5e7eb;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }

        .upload-subtitle {
          font-size: 18px;
          color: #94a3b8;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .upload-zone {
          border: 3px dashed rgba(148, 163, 184, 0.35);
          border-radius: 20px;
          padding: 60px 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(15, 23, 42, 0.6);
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
        }

        .upload-zone:hover {
          border-color: #7dd3fc;
          background: rgba(15, 23, 42, 0.7);
          transform: translateY(-2px);
        }

        .upload-zone.drag-over {
          border-color: #93c5fd;
          background: rgba(15, 23, 42, 0.8);
          transform: scale(1.02);
        }

        .upload-zone.uploading {
          border-color: #34d399;
          background: rgba(15, 23, 42, 0.7);
        }

        .upload-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .upload-icon { color: #93c5fd; opacity: 0.9; }

        .upload-text {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .upload-main-text {
          font-size: 24px;
          font-weight: 600;
          color: #e5e7eb;
        }

        .upload-sub-text {
          font-size: 16px;
          color: #94a3b8;
        }

        .upload-link {
          color: #93c5fd;
          font-weight: 600;
          text-decoration: underline;
        }

        .upload-formats {
          font-size: 14px;
          color: #a0aec0;
          margin-top: 8px;
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .progress-icon {
          color: #48bb78;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .progress-text {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .progress-bar {
          width: 300px;
          height: 8px;
          background: rgba(148, 163, 184, 0.25);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-percentage {
          font-size: 16px;
          font-weight: 600;
          color: #34d399;
        }

        .upload-options {
          margin-top: 40px;
        }

        .options-title {
          font-size: 20px;
          font-weight: 600;
          color: #e5e7eb;
          text-align: center;
          margin-bottom: 24px;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .option-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .option-card:hover {
          border-color: #93c5fd;
          transform: translateY(-2px);
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.35);
        }

        .option-icon {
          width: 48px;
          height: 48px;
          background: rgba(148, 163, 184, 0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #93c5fd;
          flex-shrink: 0;
        }

        .option-content {
          flex: 1;
        }

        .option-title {
          font-size: 16px;
          font-weight: 600;
          color: #e5e7eb;
          margin-bottom: 4px;
        }

        .option-desc {
          font-size: 14px;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .upload-container {
            padding: 100px 16px 40px;
          }

          .upload-content {
            padding: 32px 24px;
          }

          .upload-title {
            font-size: 32px;
          }

          .upload-subtitle {
            font-size: 16px;
          }

          .upload-zone {
            padding: 40px 20px;
          }

          .options-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UploadPage;
