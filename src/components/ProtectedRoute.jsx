// frontend/src/components/ProtectedRoute.jsx
import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../api";

export default function ProtectedRoute({ children }) {
  const { user, login, logout, loading: authLoading } = useContext(AuthContext);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifySession = async () => {
      try {
        // ✅ Already logged in, no need to recheck
        if (user) {
          setChecking(false);
          return;
        }

        // ✅ If AuthProvider is still checking, wait
        if (authLoading) {
          return;
        }

        // ✅ Call backend session check endpoint
        const res = await fetch(`${API_BASE}/users/check-session`, {
          method: "GET",
          credentials: "include", // send cookies
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.success && data.userId && data.sessionToken) {
            // Use sessionToken if backend returns it; otherwise fallback to localStorage
            login(data.userId, data.sessionToken || "");
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error("❌ Session check failed:", err);
        logout();
      } finally {
        setChecking(false);
      }
    };

    verifySession();
  }, [user, login, logout, authLoading]);

  // 🕓 While verifying session
  if (checking || authLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Checking session...
      </div>
    );
  }

  // 🚫 If not logged in, redirect to /auth and remember target page
  if (!user) {
    return <Navigate to="/auth" state={{ redirectTo: location.pathname }} replace />;
  }

  // ✅ If authenticated, render children
  return children;
}
