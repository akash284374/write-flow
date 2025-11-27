// server/src/controllers/authController.js

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadImage } from "../config/cloudinary.js";

// ======================= TOKEN HELPERS ===========================
const createToken = (userId) => 
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

// ======================= REGISTER ================================
export const register = async (req, res) => {
  try {
    let { email, password, name, username } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    email = email.toLowerCase().trim();
    username = username ? username.toLowerCase().trim() : name.replace(/\s+/g, "");

    const [emailExists, usernameExists] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);

    if (emailExists)
      return res.status(400).json({ success: false, message: "Email already exists" });

    if (usernameExists)
      return res.status(400).json({ success: false, message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      name,
    });

    const token = createToken(user._id);
    sendTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "User registered & logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================= LOGIN ================================
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = createToken(user._id);
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================= LOGOUT ================================
export const logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });

  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================= GET CURRENT USER ======================
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
        bio: req.user.bio,
        profileImage: req.user.profileImage,
        coverImage: req.user.coverImage,
      },
    });
  } catch (error) {
    console.error("getMe Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Profile/cover/bio update remains same (your code is correct)


// ---------------- UPDATE PROFILE IMAGE ----------------
export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = await uploadImage(req.file.path);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        coverImage: updatedUser.coverImage,
      },
    });
  } catch (err) {
    console.error("updateProfileImage error:", err);
    res.status(500).json({ error: "Failed to update profile image" });
  }
};

// ---------------- UPDATE COVER IMAGE ----------------
export const updateCoverImage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = await uploadImage(req.file.path);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { coverImage: imageUrl },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        coverImage: updatedUser.coverImage,
      },
    });
  } catch (err) {
    console.error("updateCoverImage error:", err);
    res.status(500).json({ error: "Failed to update cover image" });
  }
};

// ---------------- UPDATE BIO ----------------
export const updateBio = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { bio },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        coverImage: updatedUser.coverImage,
      },
    });
  } catch (err) {
    console.error("updateBio error:", err);
    res.status(500).json({ error: "Failed to update bio" });
  }
};
