// AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { API_BASE } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ✅ Load immediately from localStorage (instant name/phone availability)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("authUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // ---------------- SESSION CHECK ----------------
  useEffect(() => {
    const checkSession = async () => {
      const savedUser = JSON.parse(localStorage.getItem("authUser"));

      if (!savedUser?.userId || !savedUser?.sessionToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/users/check-session`, {
          method: "GET",
          headers: {
            "x-session-token": savedUser.sessionToken,
            "x-user-id": savedUser.userId,
          },
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // ✅ Merge updated user data (ensure name/phone sync)
          const mergedUser = { ...savedUser, ...data.user };
          setUser(mergedUser);
          localStorage.setItem("authUser", JSON.stringify(mergedUser));
        } else {
          setUser(null);
          localStorage.removeItem("authUser");
        }
      } catch (err) {
        console.error("Session check failed:", err);
        setUser(null);
        localStorage.removeItem("authUser");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // ✅ Login also saves full user data (id, token, name, phone)
  const login = (userId, sessionToken, extra = {}) => {
    if (!userId || !sessionToken) return;
    const userData = {
      userId: userId.trim(),
      sessionToken: sessionToken.trim(),
      name: extra.name || "",
      phone: extra.phone || "",
      ...extra, // include any extra user info
    };
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData)); // ✅ immediate persistence
  };

  const logout = async () => {
    try {
      if (user?.sessionToken) {
        await fetch(`${API_BASE}/users/logout`, {
          method: "POST",
          headers: { "x-session-token": user.sessionToken },
          credentials: "include",
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("authUser");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
