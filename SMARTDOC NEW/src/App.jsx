// // src/App.jsx
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

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

const RequireAuth = ({ children }) => {
  const { isAuthenticated, isBootstrapped } = useAuth();
  const location = useLocation();

  // Avoid redirect flicker while we're validating the stored token on load
  if (!isBootstrapped) {
    return null; // or a loader/spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

function App() {
  const location = useLocation();
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

export default App;
