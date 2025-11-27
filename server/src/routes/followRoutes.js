import express from "express";
import { protect } from "../middleware/auth.js";
import {
  toggleFollow,
  getFollowSuggestions,
  getFollowers,
  getFollowing,
  removeFriend,
} from "../controllers/followController.js";

const router = express.Router();

// ====================================================
// CORRECT ROUTE ORDER — MUST NOT BE CHANGED
// ====================================================

// ✅ Suggestions
router.get("/suggestions", protect, getFollowSuggestions);

// ✅ Followers
router.get("/followers/:userId", protect, getFollowers);

// ✅ Following
router.get("/following/:userId", protect, getFollowing);

// ✅ Remove follower (IMPORTANT: MUST BE BEFORE /:userId)
router.post("/remove-friend", protect, removeFriend);

// 🔥 Follow / Unfollow toggle (USER ID MUST BE LAST ROUTE)
router.post("/:userId", protect, toggleFollow);

export default router;
