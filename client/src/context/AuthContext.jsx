import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    // A malformed localStorage value should not stop the application from loading.
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState(getSavedUser);

  useEffect(() => {
    if (!token) return;

    let isCurrent = true;
    api.get("/api/auth/me")
      .then((response) => {
        if (!isCurrent) return;
        const refreshedUser = {
          ...response.data.user,
          is_admin: response.data.is_admin === true,
        };
        localStorage.setItem("user", JSON.stringify(refreshedUser));
        setUser(refreshedUser);
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401 && isCurrent) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      });

    return () => { isCurrent = false; };
  }, [token]);

  const saveSession = (accessToken, userData) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    saveSession(response.data.access_token, { ...response.data.user, is_admin: response.data.is_admin === true });
    return response.data;
  };

  const loginWithGoogle = async (credential) => {
    const response = await api.post("/api/auth/google", { credential });
    saveSession(response.data.access_token, { ...response.data.user, is_admin: response.data.is_admin === true });
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/api/auth/register", { name, email, password });
    saveSession(response.data.access_token, { ...response.data.user, is_admin: response.data.is_admin === true });
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData, is_admin: user?.is_admin === true };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = useMemo(
    () => ({ token, user, login, loginWithGoogle, register, logout, updateUser }),
    [token, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
