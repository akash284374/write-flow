// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import authServices from "../services/authServices";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const data = await authServices.checkAuth();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ CRITICAL: This function fetches latest user data from backend
  const refreshUser = async () => {
    try {
      console.log("🔄 Refreshing user data from backend...");
      const data = await authServices.checkAuth();
      if (data.success && data.user) {
        console.log("✅ User data refreshed:", data.user);
        setUser(data.user);
        return data.user;
      } else {
        console.error("❌ Failed to refresh user:", data);
      }
    } catch (err) {
      console.error("❌ refreshUser error:", err);
    }
  };

  const login = async (credentials) => {
    const data = await authServices.login(credentials);
    if (data.success && data.user) setUser(data.user);
    return data;
  };

  const signup = async (userData) => {
    const data = await authServices.register(userData);
    if (data.success && data.user) setUser(data.user);
    return data;
  };

  const verifyOtp = async (email, otp) => {
    return authServices.verifyOtp(email, otp);
  };

  const logout = async () => {
    try {
      await authServices.logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        verifyOtp,
        logout,
        setUser,
        refreshUser, // ✅ MUST be here
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
