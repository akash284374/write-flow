import express from "express";
import { reportUser, reportFlow, reportComment } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";  // ✅ updated import

const router = express.Router();

router.post("/user", protect, reportUser);
router.post("/flow", protect, reportFlow);
router.post("/comment", protect, reportComment);

export default router;
