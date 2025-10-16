// // src/App.jsx
import React from "react";
import { Routes, Route, Navigate, HashRouter, useLocation } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UploadPage from "./pages/UploadPage";
import DocumentsListPage from "./pages/DocumentsListPage";
import DocumentQAPage from "./pages/DocumentQAPage";
import AppHeader from "./components/AppHeader";
import AdminDashboard from "./pages/AdminDashboard";
import SharedConversationPage from "./pages/SharedConversationPage";

import { useAuth } from "./context/AuthContext";

// We create an inner component that runs inside the Router so hooks like useLocation work correctly.
function InnerApp() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapped } = useAuth();

  // RequireAuth must be defined inside Router context where useLocation is available.
  const RequireAuth = ({ children }) => {
    // Avoid redirect flicker while we're validating the stored token on load
    if (!isBootstrapped) {
      return null; // or a loader/spinner
    }
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
  };

  const hideHeader =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/qa") ||
    location.pathname.startsWith("/upload") ||
    location.pathname.startsWith("/documents") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideHeader && <AppHeader />}
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/upload"
          element={
            <RequireAuth>
              <UploadPage />
            </RequireAuth>
          }
        />
        <Route
          path="/documents"
          element={
            <RequireAuth>
              <DocumentsListPage />
            </RequireAuth>
          }
        />
        <Route
          path="/qa/:docId"
          element={
            <RequireAuth>
              <DocumentQAPage />
            </RequireAuth>
          }
        />
        <Route path="/share/:shareId" element={<SharedConversationPage />} />
      </Routes>
    </>
  );
}

function App() {
  // Use HashRouter so refreshing a page works even if the hosting server isn't serving index.html for all paths.
  // This avoids the white/blank screen on reload for SPA routes.
  return (
    <HashRouter>
      <InnerApp />
    </HashRouter>
  );
}

export default App;
