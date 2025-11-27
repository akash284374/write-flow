// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import authServices from "../services/authServices";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ Navigation added

  // ============================================
  // INITIAL AUTH CHECK
  // ============================================
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setUser(null);
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

  // ============================================
  // REFRESH USER
  // ============================================
  const refreshUser = async () => {
    try {
      const data = await authServices.checkAuth();
      if (data.success && data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error("refreshUser error:", err);
    }
  };

  // ============================================
  // LOGIN (Auto redirect to Home)
  // ============================================
  const login = async (credentials) => {
    const data = await authServices.login(credentials);

    if (data.success && data.user) {
      setUser(data.user);
      navigate("/"); // 🔥 redirect to homepage
    }

    return data;
  };

  // ============================================
  // SIGNUP (Auto redirect to Home)
  // ============================================
  const signup = async (userData) => {
    const data = await authServices.register(userData);

    if (data.success && data.user) {
      setUser(data.user);
      navigate("/"); // 🔥 redirect to homepage
    }

    return data;
  };

  // ============================================
  // OTP VERIFICATION
  // ============================================
  const verifyOtp = async (email, otp) => {
    return authServices.verifyOtp(email, otp);
  };

  // ============================================
  // LOGOUT (Auto redirect to login)
  // ============================================
  const logout = async () => {
    try {
      await authServices.logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      navigate("/login"); // 🔥 redirect
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
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
