import express from "express";
import {
  getFollowingUsers,
  isAlreadyFollowing,
  updateUserAboutSection,
  updateProfile,
  changePassword,       // <-- ADD THIS
  followToggle,
  getFollowers,
  getFollowing,
  getTopUsers,
  getAllUsers,
  deleteAccount 
} from "../controllers/userController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

/* ----------------------------------------
   STATIC ROUTES FIRST
----------------------------------------- */

router.delete("/delete", protect, deleteAccount);

// Profile Update
router.put("/profile", protect, updateProfile);

// About Update
router.put("/about", protect, updateUserAboutSection);

// ⭐ FIX: Change Password (STATIC ROUTE)
router.put("/change-password", protect, changePassword);

// Get all users
router.get("/", protect, getAllUsers);

// Get top users
router.get("/top", getTopUsers);

/* ----------------------------------------
   FOLLOW SYSTEM
----------------------------------------- */

router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);
router.get("/:id/is-following", protect, isAlreadyFollowing);
router.post("/:id/follow-toggle", protect, followToggle);

router.get("/:userId/following-users", getFollowingUsers);

export default router;
