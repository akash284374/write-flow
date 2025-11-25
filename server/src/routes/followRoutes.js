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

// ✅ Toggle follow/unfollow
router.post("/:userId", protect, toggleFollow);

// ✅ Suggestions
router.get("/suggestions", protect, getFollowSuggestions);

// ✅ Followers list
router.get("/followers/:userId", protect, getFollowers);

// ✅ Following list
router.get("/following/:userId", protect, getFollowing);

// ✅ Remove follower (block/remove)
router.post("/remove-friend", protect, removeFriend);

export default router;
