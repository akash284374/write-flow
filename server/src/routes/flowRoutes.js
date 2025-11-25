import express from "express";
import * as flowCtrl from "../controllers/flowController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

// =======================
// USER'S FLOWS ENDPOINT
// =======================
router.get("/user", protect, flowCtrl.getUserFlows); // /api/flows/user

// === FEED ENDPOINTS ===
router.get("/", protect, flowCtrl.getAllFlows); // ✅ all blogs (with user info for like/bookmark)

router.get("/home", flowCtrl.getFlowForHome);   // published/filtered

// Drafts (author only)
router.get("/drafts/:userId", protect, flowCtrl.getDraftFlow);

// === BOOKMARKS ===
router.post("/:flowId/bookmark", protect, flowCtrl.toggleBookmark);
router.get("/:flowId/bookmark", protect, flowCtrl.isBookmarked);

// === CREATE / DELETE ===
router.post("/", protect, upload.single("flowImage"), flowCtrl.createFlow);
router.delete("/:flowId", protect, flowCtrl.deleteFlow);

// === THUMBNAIL UPLOAD ===
router.post("/:flowId/thumbnail", protect, upload.single("image"), flowCtrl.thumbnailUpload);

// === UPDATES ===
router.put("/:flowId/content", protect, flowCtrl.updateContent);
router.put("/:flowId/title", protect, flowCtrl.updateTitle);
router.put("/:flowId/description", protect, flowCtrl.updateDescription);
router.post("/:flowId/publish", protect, flowCtrl.publishFlow);

// === LIKES & VIEWS ===
router.post("/:flowId/like", protect, flowCtrl.likeFlow);
router.post("/:flowId/view", protect, flowCtrl.viewFlow);
router.get("/:flowId/is-viewed", protect, flowCtrl.isAlreadyViewed);

// === COMMENTS ===
router.post("/:flowId/comments", protect, flowCtrl.commentFlow);
router.get("/:flowId/comments", flowCtrl.getComments);
router.delete("/:flowId/comments/:commentId", protect, flowCtrl.deleteComment);


// === COMMENT LIKES ===
router.post("/comments/:commentId/like", protect, flowCtrl.likeComment);
router.get("/comments/:commentId/is-liked", protect, flowCtrl.alreadyLikedComment);
// === COMMENT REPLY ===
router.post("/:flowId/comments/:commentId/reply", protect, flowCtrl.replyComment);


// === FLOW BY ID ===
router.get("/:flowId", flowCtrl.getFlowWithId);

export default router;
