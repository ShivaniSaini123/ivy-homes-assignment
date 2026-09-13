import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContextDef";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        try {
          localStorage.setItem("ivy_user", JSON.stringify(data.user));
        } catch {
          // Ignored
        }
      } else {
        setUser(null);
        try {
          localStorage.removeItem("ivy_user");
        } catch {
          // Ignored
        }
      }
    } catch (err) {
      console.warn("Session check failed (network/offline):", err.message);
      setUser(null);
      try {
        localStorage.removeItem("ivy_user");
      } catch {
        // Ignored
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    fetch(`${API_BASE}/auth/me`, {
      credentials: "include"
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isCancelled) {
          if (data?.user) {
            setUser(data.user);
            try {
              localStorage.setItem("ivy_user", JSON.stringify(data.user));
            } catch {
              // Ignored
            }
          } else {
            setUser(null);
            try {
              localStorage.removeItem("ivy_user");
            } catch {
              // Ignored
            }
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Session check failed (network/offline):", err.message);
        if (!isCancelled) {
          setUser(null);
          try {
            localStorage.removeItem("ivy_user");
          } catch {
            // Ignored
          }
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.error || "Login failed. Please check your credentials.";
        setError(msg);
        throw new Error(msg);
      }

      setUser(data.user);
      try {
        localStorage.setItem("ivy_user", JSON.stringify(data.user));
      } catch {
        // Ignored
      }
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message || "An error occurred during sign in");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.warn("Logout request error:", err.message);
    } finally {
      setUser(null);
      try {
        localStorage.removeItem("ivy_user");
      } catch {
        // Ignored
      }
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    error,
    login,
    logout,
    checkSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
