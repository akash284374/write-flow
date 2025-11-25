// server/src/routes/authRoutes.js
import express from "express";
import { 
  register, 
  login, 
  logout, 
  getMe,
  updateBio,
  updateProfileImage,
  updateCoverImage
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js"; // Make sure you have multer middleware

const router = express.Router();

// ---------------- AUTH ROUTES ----------------
router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

// ---------------- PROFILE UPDATE ROUTES ----------------
router.put("/update-bio", protect, updateBio);
router.put("/update-profile-image", protect, upload.single("profileImage"), updateProfileImage);
router.put("/update-cover-image", protect, upload.single("coverImage"), updateCoverImage);

export default router;
