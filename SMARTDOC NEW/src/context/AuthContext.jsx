// // // src/context/AuthContext.jsx
// import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";
// const AuthContext = createContext(null);

// function decodeJwt(token) {
//   try {
//     const base64 = token.split(".")[1];
//     const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }

// export const AuthProvider = ({ children }) => {
//   // undefined = still checking, true = logged in, false = logged out
//   const [isAuthenticated, setIsAuthenticated] = useState(undefined);
//   const refreshTimer = useRef(null);

//   const clearRefreshTimer = () => {
//     if (refreshTimer.current) {
//       clearTimeout(refreshTimer.current);
//       refreshTimer.current = null;
//     }
//   };

//   const scheduleSilentRefresh = (token) => {
//     clearRefreshTimer();
//     const payload = decodeJwt(token);
//     if (!payload?.exp) return;

//     const msUntilExpiry = payload.exp * 1000 - Date.now();
//     const refreshIn = Math.max(60_000, msUntilExpiry - 5 * 60 * 1000); // refresh 5min before expiry

//     refreshTimer.current = setTimeout(async () => {
//       try {
//         const res = await axios.post(`${API_BASE}/api/refresh`);
//         const newToken = res.data?.token;
//         if (newToken) {
//           localStorage.setItem("jwt_token", newToken);
//           axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
//           scheduleSilentRefresh(newToken);
//         }
//       } catch {
//         logout();
//       }
//     }, refreshIn);
//   };

//   const bootstrap = async () => {
//     const token = localStorage.getItem("jwt_token");
//     if (!token) {
//       setIsAuthenticated(false);
//       return;
//     }

//     axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     try {
//       await axios.get(`${API_BASE}/api/me`);
//       setIsAuthenticated(true);
//       scheduleSilentRefresh(token);
//     } catch (err) {
//       console.warn("Token invalid, removing:", err?.response?.status);
//       localStorage.removeItem("jwt_token");
//       delete axios.defaults.headers.common["Authorization"];
//       setIsAuthenticated(false);
//     }
//   };

//   useEffect(() => {
//     bootstrap();

//     const interceptor = axios.interceptors.response.use(
//       (r) => r,
//       (error) => {
//         if (error.response?.status === 401) {
//           logout();
//         }
//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       axios.interceptors.response.eject(interceptor);
//       clearRefreshTimer();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const login = (token) => {
//     localStorage.setItem("jwt_token", token);
//     axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     setIsAuthenticated(true);
//     scheduleSilentRefresh(token);
//   };

//   const logout = () => {
//     localStorage.removeItem("jwt_token");
//     delete axios.defaults.headers.common["Authorization"];
//     clearRefreshTimer();
//     setIsAuthenticated(false);
//   };

//   const value = useMemo(
//     () => ({ isAuthenticated, login, logout }),
//     [isAuthenticated]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
//   return ctx;
// };
// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const refreshTimer = useRef(null);

  const clearRefreshTimer = () => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  };

  const scheduleSilentRefresh = (token) => {
    clearRefreshTimer();
    const payload = decodeJwt(token);
    if (!payload?.exp) return;
    const msUntilExpiry = payload.exp * 1000 - Date.now();
    // refresh 5 minutes before expiry; never sooner than 1 minute from now
    const refreshIn = Math.max(60_000, msUntilExpiry - 5 * 60_000);
    // Disabled server refresh to avoid unwanted redirects/logouts
    // refreshTimer.current = setTimeout(async () => {
    //   try {
    //     const res = await axios.post(`${API_BASE}/api/refresh`);
    //     const newToken = res.data?.token;
    //     if (newToken) {
    //       localStorage.setItem("jwt_token", newToken);
    //       axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    //       scheduleSilentRefresh(newToken);
    //     }
    //   } catch (err) {
    //     console.warn("/api/refresh failed:", err?.response?.status || err?.message);
    //   }
    // }, refreshIn);
  };

  const bootstrap = async () => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      setIsAuthenticated(false);
      setIsBootstrapped(true);
      return;
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      await axios.get(`${API_BASE}/api/me`);
      setIsAuthenticated(true);
      // scheduleSilentRefresh(token); // disabled
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        // Only clear token on explicit unauthorized
        localStorage.removeItem("jwt_token");
        delete axios.defaults.headers.common["Authorization"];
        setIsAuthenticated(false);
      } else {
        // Network/other errors: do not force logout; allow app to continue
        console.warn("/api/me check failed, preserving session:", status || err?.message);
        setIsAuthenticated(true);
      }
    } finally {
      setIsBootstrapped(true);
    }
  };

  useEffect(() => {
    bootstrap();

    // Intercept 401 responses globally
    const interceptor = axios.interceptors.response.use(
      (r) => r,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
      clearRefreshTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token) => {
    localStorage.setItem('jwt_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
    // startRefreshTimer();
    // Remove automatic navigation - let calling component handle it
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    delete axios.defaults.headers.common["Authorization"];
    clearRefreshTimer();
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({ isAuthenticated, isBootstrapped, login, logout }),
    [isAuthenticated, isBootstrapped]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

