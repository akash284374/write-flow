// server/src/routes/userDashboardRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
    getHistoryData,
    getBookmarkData,
    getLikedData,
    getPublishedData,
    getDraftData,
} from "../controllers/userDashboardController.js";

const router = express.Router();

// ✅ Protected routes
router.get("/history", protect, async (req, res) => {
    const data = await getHistoryData(req.user._id);
    res.json(data);
});

router.get("/bookmarks", protect, async (req, res) => {
    const data = await getBookmarkData(req.user._id);
    res.json(data);
});

router.get("/liked", protect, async (req, res) => {
    const data = await getLikedData(req.user._id);
    res.json(data);
});

router.get("/published", protect, async (req, res) => {
    const data = await getPublishedData(req.user._id);
    res.json(data);
});

router.get("/drafts", protect, async (req, res) => {
    const data = await getDraftData(req.user._id);
    res.json(data);
});

export default router;
