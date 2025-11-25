// src/services/authServices.js
import api from "./api";

// ---------------- AUTH SERVICES ----------------

// Verify OTP
export const verifyOtp = async (email, otp) => {
  try {
    const res = await api.post(
      "/auth/verify-otp",
      { email, otp },
      { withCredentials: true }
    );
    return {
      success: true,
      message: res?.data?.message || "OTP verified",
      user: res?.data?.user || null,
    };
  } catch (error) {
    console.error("verifyOtp error:", error.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "OTP verification failed",
      user: null,
    };
  }
};

// Register
export const register = async (userData) => {
  try {
    const res = await api.post("/auth/register", userData, { withCredentials: true });
    return {
      success: true,
      message: res?.data?.message || "Signup successful",
      user: res?.data?.user || null,
    };
  } catch (error) {
    console.error("register error:", error.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Signup failed",
      user: null,
    };
  }
};

// Login
export const login = async (credentials) => {
  try {
    const res = await api.post("/auth/login", credentials, { withCredentials: true });
    return {
      success: true,
      message: res?.data?.message || "Login successful",
      user: res?.data?.user || null,
    };
  } catch (error) {
    console.error("login error:", error.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Login failed",
      user: null,
    };
  }
};

// Check current session
export const checkAuth = async () => {
  try {
    const res = await api.get("/auth/me", { withCredentials: true });
    return {
      success: true,
      user: res?.data?.user || null,
    };
  } catch (error) {
    console.error("checkAuth error:", error.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Not authenticated",
      user: null,
    };
  }
};

// Logout
export const logout = async () => {
  try {
    await api.post("/auth/logout", {}, { withCredentials: true });
    return { success: true };
  } catch (error) {
    console.error("logout error:", error.response?.data || error.message);
    return { success: false };
  }
};

// Update Profile Picture
export const updateProfileImage = async (formData) => {
  try {
    const res = await api.put("/auth/update-profile-image", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      success: true,
      message: res?.data?.message || "Profile picture updated",
      user: res?.data?.user || null,
    };
  } catch (error) {
    console.error("updateProfileImage error:", error.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Profile update failed",
      user: null,
    };
  }
};

// Update Cover Picture
export const updateCoverImage = async (formData) => {
  try {
    const res = await api.put("/auth/update-cover-image", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      success: true,
      message: res?.data?.message || "Cover picture updated",
      user: res?.data?.user || null,
    };
  } catch (error) {
    console.error("updateCoverImage error:", error.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Cover update failed",
      user: null,
    };
  }
};

// Export all services
const authServices = {
  verifyOtp,
  register,
  login,
  checkAuth,
  logout,
  updateProfileImage,
  updateCoverImage,
};

export default authServices;
