// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import { AuthProvider } from './context/AuthContext';
// import App from './App.jsx';
// import './index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
//       <AuthProvider>
//         <App />
//       </AuthProvider>
//     </GoogleOAuthProvider>
//   </React.StrictMode>
// );
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

// Non-blocking warm-up ping to wake sleeping backends (tries once, logs outcome)
async function wakeBackendOnce() {
  const url = `${API_BASE.replace(/\/$/, '')}/api/health`;
  const controller = new AbortController();
  const timeoutMs = 6000;
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.info(`[wakeBackend] pinging ${url}`);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      console.info('[wakeBackend] backend responded OK', res.status);
    } else {
      console.warn('[wakeBackend] backend returned non-OK status', res.status);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[wakeBackend] ping timed out (backend may be sleeping or unreachable)');
    } else {
      console.warn('[wakeBackend] ping failed:', err);
    }
  }
}

// Render app then run warm-up in background
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);

// Small delay so the UI mounts before the ping logs appear
setTimeout(() => {
  wakeBackendOnce();
}, 400);

