import express from "express";
import {
  getSevenDaysViews,
  getThirtyDaysViews,
  getTotalViews,
  getPerDayViews,
  getSevenDaysFollowers,
  getThirtyDaysFollowers,
  getTotalFollowers,
  getRecentBlog,
  getTotalFlowsAndFollowers,
} from "../controllers/dashboardController.js";

const router = express.Router();

// ===== Views =====
router.get("/views/7days/:userId", getSevenDaysViews);
router.get("/views/30days/:userId", getThirtyDaysViews);
router.get("/views/total/:userId", getTotalViews);
router.get("/views/perday/:userId/:days", getPerDayViews);

// ===== Followers =====
router.get("/followers/7days/:userId", getSevenDaysFollowers);
router.get("/followers/30days/:userId", getThirtyDaysFollowers);
router.get("/followers/total/:userId", getTotalFollowers);

// ===== Recent Blogs =====
router.get("/recentblogs/:userId", getRecentBlog);

// ===== Total Flows & Followers =====
router.get("/totals/:userId", getTotalFlowsAndFollowers);

export default router;
