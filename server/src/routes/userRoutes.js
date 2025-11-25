// routes/userRoutes.js
import express from "express";
import {
  getFollowingUsers,
  isAlreadyFollowing,
  updateUserAboutSection,
  followToggle,
  getFollowers,
  getFollowing,
  getTopUsers,
  getAllUsers,   // ✅ NEW CONTROLLER
} from "../controllers/userController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// ✅ Get all users (for Search page) - requires logged in user
router.get("/", protect, getAllUsers);

// ✅ Get full following users list (public, no auth needed)
router.get("/:userId/following-users", getFollowingUsers);

// ✅ Check if already following (requires logged-in user)
router.get("/:id/is-following", protect, isAlreadyFollowing);

// ✅ Update user about section (requires logged-in user)
router.put("/about", protect, updateUserAboutSection);

// ✅ Follow/Unfollow toggle (requires logged-in user)
router.post("/:id/follow-toggle", protect, followToggle);

// ✅ Get followers of a user (public)
router.get("/:id/followers", getFollowers);

// ✅ Get following of a user (public)
router.get("/:id/following", getFollowing);

// ✅ Get top users with optional filter (public)
router.get("/top", getTopUsers);

export default router;
