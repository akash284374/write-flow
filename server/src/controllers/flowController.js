// src/controllers/flowController.js
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { uploadImage } from "../config/cloudinary.js";
import {
  User,
  Blog,
  View,
  BlogLike,
  Comment,
  CommentLike,
  Tag,
  Notification,
  Report,
  Follow,
  Log,
  Request,
  ErrorModel,
} from "../models/index.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Ensure user is authenticated (accept either req.user._id or req.user.id) */
const requireAuth = (req, res) => {
  if (!req.user || !(req.user._id || req.user.id)) {
    res.status(401).json({ success: false, message: "You are not logged in" });
    return false;
  }
  return true;
};

/* ------------------------------------------------------------------
    HELPERS
-------------------------------------------------------------------*/
const resolveUserId = (req) => {
  // prefer _id, fall back to id; always return string or null
  return (req.user?._id || req.user?.id) ? String(req.user._id ?? req.user.id) : null;
};

/* ------------------------------------------------------------------
    FORMAT BLOGS FOR FRONTEND (includes isLiked / isBookmarked)
-------------------------------------------------------------------*/
const formatBlogsForUser = async (blogs, userIdRaw) => {
  const userId = userIdRaw ? String(userIdRaw) : null;
  const blogIds = blogs.map((b) => b._id.toString());

  let likedSet = new Set();
  let bookmarkedSet = new Set();

  if (userId) {
    // fetch likes for these blogs by this user
    const likes = await BlogLike.find({
      user: userId,
      blog: { $in: blogIds },
    }).select("blog");

    likedSet = new Set(likes.map((l) => l.blog.toString()));

    const userDoc = await User.findById(userId).select("bookmarks");
    bookmarkedSet = new Set(userDoc?.bookmarks?.map((b) => b.toString()) || []);
  }

  return blogs.map((blog) => {
    const obj = blog.toObject();

    return {
      _id: obj._id,
      title: obj.title,
      description: obj.description,
      content: obj.content,
      image: obj.coverImage || obj.thumbnail || null,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,

      user: obj.user,
      tags: Array.isArray(obj.tags) ? obj.tags : [],

      // keys expected by frontend
      isLiked: likedSet.has(obj._id.toString()),
      isBookmarked: bookmarkedSet.has(obj._id.toString()),
      likeCount: obj.likeCount || 0,
      commentCount: obj.commentCount || 0,
      viewCount: obj.viewCount || 0,
    };
  });
};

/* ------------------------------------------------------------------
   GET ALL FLOWS
-------------------------------------------------------------------*/
export const getAllFlows = async (req, res) => {
  try {
    const userId = resolveUserId(req);

    const flows = await Blog.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "name username image email" });

    const formatted = await formatBlogsForUser(flows, userId);

    const comments = await Comment.find({ blog: { $in: formatted.map((b) => b._id) } })
      .populate("user", "username name email image")
      .sort({ createdAt: 1 });

    const commentMap = {};
    comments.forEach((c) => {
      const id = c.blog.toString();
      if (!commentMap[id]) commentMap[id] = [];
      commentMap[id].push(c);
    });

    const final = formatted.map((flow) => ({
      ...flow,
      comments: commentMap[flow._id.toString()] || [],
    }));

    return res.json({ success: true, data: final });
  } catch (error) {
    console.error("getAllFlows error:", error);
    return res.status(500).json({ error: "Unexpected error while fetching flows." });
  }
};

/* ------------------------------------------------------------------
   CREATE FLOW
-------------------------------------------------------------------*/
export const createFlow = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);

    const { title, description = "", content = "", jsonContent = null, tags = [], isPublished = false } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const blog = new Blog({
      title,
      description,
      content,
      jsonContent,
      user: userId,
      isPublished,
      isCommentOff: false,
      likeCount: 0,
      viewCount: 0,
      commentCount: 0,
    });

    await blog.save();

    if (Array.isArray(tags) && tags.length > 0) {
      const tagIds = [];
      for (const t of tags) {
        const tagText = (t || "").trim();
        if (!tagText) continue;
        let tag = await Tag.findOne({ tag: tagText });
        if (!tag) {
          tag = await Tag.create({ tag: tagText, postsCount: 0, posts: [] });
        }
        if (!tag.posts.includes(blog._id)) {
          tag.posts.push(blog._id);
          tag.postsCount = (tag.postsCount || 0) + 1;
          await tag.save();
        }
        tagIds.push(tag._id);
      }
      blog.tags = tagIds;
      await blog.save();
    }
    return res.status(201).json({ success: `${blog.title} is created!!!`, id: blog._id, data: blog });
  } catch (error) {
    console.error("createFlow error:", error);
    await ErrorModel?.create?.({ action: "createFlow", message: error.message }).catch(() => null);
    return res.status(500).json({ error: "Unexpected error while creating flow!!!" });
  }
};

/* ------------------------------------------------------------------
   DELETE FLOW
-------------------------------------------------------------------*/
export const deleteFlow = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;

    if (!isValidObjectId(flowId)) return res.status(400).json({ error: "Invalid flowId" });

    const deleted = await Blog.findOneAndDelete({ _id: flowId, user: userId });
    if (!deleted) return res.status(404).json({ error: "Flow not found or not authorized" });

    // Use correct field names for deletion
    await Comment.deleteMany({ blog: flowId }).catch(() => null);
    await View.deleteMany({ blogId: flowId }).catch(() => null); // view stores blogId in your code
    await BlogLike.deleteMany({ blog: flowId }).catch(() => null);
    // optional - leave commentLikes removal if you know commentIds to delete
    // await CommentLike.deleteMany({ commentId: { $in: [] } }).catch(() => null);

    return res.json({ success: "Flow deleted!!!" });
  } catch (error) {
    console.error("deleteFlow error:", error);
    await ErrorModel?.create?.({ action: "deleteFlow", message: error.message }).catch(() => null);
    return res.status(500).json({ error: "Unexpected error while deleting flow!!!" });
  }
};

/* ------------------------------------------------------------------
   GET FLOW BY ID
-------------------------------------------------------------------*/
export const getFlowWithId = async (req, res) => {
  try {
    const { flowId } = req.params;
    if (!isValidObjectId(flowId)) return res.status(400).json({ error: "Invalid flow id" });

    const flow = await Blog.findById(flowId)
      .populate({ path: "user", select: "name username image email" })
      .populate({ path: "tags", select: "tag postsCount" });

    if (!flow) return res.status(404).json({ error: "Flow not found" });

    const userId = resolveUserId(req);
    let isLiked = false, isBookmarked = false;
    if (userId) {
      isLiked = !!(await BlogLike.findOne({ user: userId, blog: flowId }));
      const user = await User.findById(userId).select("bookmarks");
      isBookmarked = !!(user?.bookmarks || []).find(b => b.toString() === flowId);
    }
    return res.json({ data: { ...flow.toObject(), isLiked, isBookmarked } });
  } catch (error) {
    console.error("getFlowWithId error:", error);
    return res.status(500).json({ error: "Unexpected error while fetching flow!" });
  }
};

/* ------------------------------------------------------------------
   GET USER FLOWS
-------------------------------------------------------------------*/
export const getUserFlows = async (req, res) => {
  try {
    if (!req.user || !(req.user._id || req.user.id)) {
      return res.status(401).json({ error: "Not authorized" });
    }
    const userId = resolveUserId(req);
    const flows = await Blog.find({ user: userId }).sort({ createdAt: -1 });
    return res.json({ posts: flows });
  } catch (error) {
    console.error("getUserFlows error:", error);
    return res.status(500).json({ error: "Unexpected error while fetching your flows" });
  }
};

/* ------------------------------------------------------------------
   GET FLOW FOR HOME (PUBLIC)
-------------------------------------------------------------------*/
export const getFlowForHome = async (req, res) => {
  try {
    const filter = (req.query.filter || "").trim();
    let reportFilter = [];
    const userId = resolveUserId(req);

    if (userId) {
      const reports = await Report.find({ reporterId: userId }).select("reportedBlogId");
      reports.forEach((r) => r.reportedBlogId && reportFilter.push(r.reportedBlogId.toString()));
    }

    const orConditions = [
      { title: { $regex: filter, $options: "i" } },
      { description: { $regex: filter, $options: "i" } },
    ];

    const query = {
      _id: { $nin: reportFilter },
      isPublished: true,
      $or: orConditions,
    };

    let flows = await Blog.find(query)
      .populate({ path: "user", select: "name username email image" })
      .populate({ path: "tags", select: "tag" })
      .sort({ publishedAt: -1 });

    const formatted = await formatBlogsForUser(flows, userId);
    return res.json({ data: formatted });
  } catch (error) {
    console.error("getFlowForHome error:", error);
    return res.status(500).json({ error: "Unexpected error while fetching flows" });
  }
};

/* ------------------------------------------------------------------
   GET DRAFTS (AUTHOR ONLY)
-------------------------------------------------------------------*/
export const getDraftFlow = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User id is required" });

    const requesterId = resolveUserId(req);
    if (requesterId !== String(userId))
      return res.status(403).json({ error: "Not authorized" });

    const drafts = await Blog.find({ user: userId, isPublished: false }).sort({ updatedAt: -1 });
    return res.json({ data: drafts });
  } catch (error) {
    console.error("getDraftFlow error:", error);
    return res.status(500).json({ error: "Unexpected error while fetching drafts" });
  }
};

/* ------------------------------------------------------------------
   TOGGLE BOOKMARK
-------------------------------------------------------------------*/
export const toggleBookmark = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;

    if (!isValidObjectId(flowId)) return res.status(400).json({ error: "Invalid flowId" });

    const user = await User.findById(userId).select("bookmarks");
    if (!user) return res.status(404).json({ error: "User not found" });

    const strFlowId = String(flowId);
    const isBookmarked = user.bookmarks?.some((b) => b.toString() === strFlowId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((b) => b.toString() !== strFlowId);
      await user.save();
      return res.json({ success: true, isBookmarked: false });
    } else {
      user.bookmarks.push(flowId);
      await user.save();
      return res.json({ success: true, isBookmarked: true });
    }
  } catch (error) {
    console.error("toggleBookmark error:", error);
    return res.status(500).json({ error: "Unexpected error while bookmarking!!!" });
  }
};

/* ------------------------------------------------------------------
   IS BOOKMARKED
-------------------------------------------------------------------*/
export const isBookmarked = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;
    if (!isValidObjectId(flowId)) return res.status(400).json({ error: "Invalid flowId" });

    const user = await User.findById(userId).select("bookmarks");
    if (!user) return res.status(404).json({ error: "User not found" });

    const isB = !!(user.bookmarks || []).find((b) => b.toString() === String(flowId));
    return res.json({ data: isB });
  } catch (error) {
    console.error("isBookmarked error:", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
};

/* ------------------------------------------------------------------
   THUMBNAIL UPLOAD
-------------------------------------------------------------------*/
export const thumbnailUpload = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;

    if (!flowId) return res.status(400).json({ success: false, message: "Flow ID is required" });
    if (!req.file) return res.status(400).json({ success: false, message: "Image file is required" });

    const localPath = req.file.path.replace(/\\/g, "/");
    const thumbnailUrl = await uploadImage(localPath);
    if (!thumbnailUrl) return res.status(500).json({ success: false, message: "Failed to upload thumbnail" });

    // Use 'user' field (not userId) when updating blog author
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: flowId, user: userId },
      { thumbnail: thumbnailUrl },
      { new: true }
    );

    if (!updatedBlog) return res.status(404).json({ success: false, message: "Flow not found or not authorized" });

    return res.status(200).json({ success: true, message: "Thumbnail uploaded successfully", data: updatedBlog });
  } catch (err) {
    console.error("❌ thumbnailUpload error:", err);
    return res.status(500).json({ success: false, message: "Unexpected error while uploading thumbnail", error: err.message });
  }
};

/* ------------------------------------------------------------------
   UPDATE CONTENT / TITLE / DESCRIPTION
-------------------------------------------------------------------*/
export const updateContent = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;
    const { content, jsonContent } = req.body;

    if (!flowId) return res.status(400).json({ error: "Flow Id required" });
    if (!isValidObjectId(flowId)) return res.status(400).json({ error: "Invalid flowId" });

    const updated = await Blog.findOneAndUpdate({ _id: flowId, user: userId, isPublished: false }, { content, jsonContent }, { new: true });

    if (!updated) return res.status(400).json({ error: "Unexpected error while updating flow content!!!" });
    return res.json({ success: "Flow content updated!!!", data: updated });
  } catch (error) {
    console.error("updateContent error:", error);
    return res.status(500).json({ error: "Unexpected error while updating flow content!!!" });
  }
};

export const updateTitle = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;
    let { title } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });
    title = title.replace(/\s{2,}/g, " ");

    const updated = await Blog.findOneAndUpdate({ _id: flowId, user: userId, isPublished: false }, { title }, { new: true });

    if (!updated) return res.status(400).json({ error: "Unexpected error while updating flow title!!!" });
    return res.json({ success: "Flow title updated!!!", data: updated });
  } catch (error) {
    console.error("updateTitle error:", error);
    return res.status(500).json({ error: "Unexpected error while updating flow title!!!" });
  }
};

export const updateDescription = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;
    const { description } = req.body;

    const updated = await Blog.findOneAndUpdate({ _id: flowId, user: userId, isPublished: false }, { description }, { new: true });

    if (!updated) return res.status(400).json({ error: "Unexpected error while updating flow description!!!" });
    return res.json({ success: "Flow description updated!!!", data: updated });
  } catch (error) {
    console.error("updateDescription error:", error);
    return res.status(500).json({ error: "Unexpected error while updating flow description!!!" });
  }
};

/* ------------------------------------------------------------------
   PUBLISH FLOW
-------------------------------------------------------------------*/
export const publishFlow = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;
    const { tags = [], isCommentOff = false, slug = "" } = req.body;

    if (!isValidObjectId(flowId)) return res.status(400).json({ error: "Invalid flowId" });

    const blog = await Blog.findOneAndUpdate(
      { _id: flowId, user: userId, isPublished: false },
      { isPublished: true, isCommentOff, slug, publishedAt: new Date() },
      { new: true }
    );
    if (!blog) return res.status(400).json({ error: "Flow not found or already published or unauthorized" });

    if (Array.isArray(tags) && tags.length > 0) {
      const tagIds = [];
      for (const tagTextRaw of tags) {
        const tagText = (tagTextRaw || "").trim();
        if (!tagText) continue;
        let tag = await Tag.findOne({ tag: tagText });
        if (!tag) {
          tag = await Tag.create({ tag: tagText, postsCount: 0, posts: [] });
        }
        if (!tag.posts.includes(blog._id)) {
          tag.posts.push(blog._id);
          tag.postsCount = (tag.postsCount || 0) + 1;
          await tag.save();
        }
        tagIds.push(tag._id);
      }
      blog.tags = tagIds;
      await blog.save();
    }

    return res.json({ success: "Flow published!!!", data: blog._id });
  } catch (error) {
    console.error("publishFlow error:", error);
    return res.status(500).json({ error: "Unexpected error while publishing flow!!!" });
  }
};

/* ------------------------------------------------------------------
   LIKE FLOW (fixed)
-------------------------------------------------------------------*/
export const likeFlow = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const userId = resolveUserId(req);
    const { flowId } = req.params;

    if (!isValidObjectId(flowId)) return res.status(400).json({ error: "Invalid flowId" });

    // Check existing like
    const existingLike = await BlogLike.findOne({ user: userId, blog: flowId });

    let updatedBlog;
    let isLiked;

    if (existingLike) {
      // Unlike
      await BlogLike.deleteOne({ _id: existingLike._id });
      updatedBlog = await Blog.findByIdAndUpdate(flowId, { $inc: { likeCount: -1 } }, { new: true }).select("likeCount");
      isLiked = false;
    } else {
      // Like
      await BlogLike.create({ user: userId, blog: flowId });
      updatedBlog = await Blog.findByIdAndUpdate(flowId, { $inc: { likeCount: 1 } }, { new: true }).select("likeCount");
      isLiked = true;
    }

    return res.json({ success: true, data: { likeCount: updatedBlog.likeCount, isLiked } });
  } catch (error) {
    console.error("LIKE FLOW ERROR:", error);
    // If duplicate key or validation error occurs, it will be logged here.
    return res.status(500).json({ error: "Unexpected error while liking/unliking flow" });
  }
};

/* ------------------------------------------------------------------
   IS ALREADY VIEWED / VIEW FLOW
-------------------------------------------------------------------*/
export const isAlreadyViewed = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;

    if (!isValidObjectId(flowId)) return res.status(400).json({ error: "Invalid flowId" });

    const already = await View.findOne({ userId, blogId: flowId });
    return res.json({ data: !!already });
  } catch (error) {
    console.error("isAlreadyViewed error:", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
};

export const viewFlow = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;
    if (!isValidObjectId(flowId)) return res.status(400).json({ error: "Invalid flowId" });

    const existing = await View.findOne({ userId, blogId: flowId });
    if (existing) return res.json({ success: "Already viewed" });

    await View.create({ userId, blogId: flowId });
    // increment viewCount (model field)
    await Blog.findByIdAndUpdate(flowId, { $inc: { viewCount: 1 } }).catch(() => null);

    return res.json({ success: "Flow viewed!!!" });
  } catch (error) {
    console.error("viewFlow error:", error);
    return res.status(500).json({ error: "Unexpected error while viewing flow!!!" });
  }
};

/* ------------------------------------------------------------------
   COMMENTS (create / like / get / delete / reply)
-------------------------------------------------------------------*/
export const commentFlow = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId } = req.params;
    const { content, parent = null } = req.body;

    if (!content || !content.trim()) return res.status(400).json({ error: "Content is required" });

    const newComment = await Comment.create({ blog: flowId, user: userId, content, parent });

    await Blog.findByIdAndUpdate(flowId, { $inc: { commentCount: 1 } });

    return res.json({ success: true, data: newComment });
  } catch (error) {
    console.error("commentFlow error:", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
};

export const alreadyLikedComment = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) return res.status(400).json({ error: "Invalid commentId" });

    const existing = await CommentLike.findOne({ userId, commentId });
    return res.json({ data: !!existing });
  } catch (error) {
    console.error("alreadyLikedComment error:", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
};

export const likeComment = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const index = comment.likes.indexOf(userId);
    if (index !== -1) comment.likes.splice(index, 1);
    else comment.likes.push(userId);

    await comment.save();
    return res.json({ success: true, likeCount: comment.likes.length });
  } catch (error) {
    console.error("likeComment error:", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
};

export const getComments = async (req, res) => {
  try {
    const { flowId } = req.params;

    const comments = await Comment.find({ blog: flowId, parent: null })
      .populate("user", "name username image")
      .populate({ path: "children", populate: { path: "user", select: "name username image" } })
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: comments });
  } catch (error) {
    console.error("getComments error:", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.user.toString() !== userId.toString()) return res.status(403).json({ error: "You can delete only your own comment" });

    await comment.deleteOne();
    return res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("deleteComment error:", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
};

export const replyComment = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const userId = resolveUserId(req);
    const { flowId, commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) return res.status(400).json({ error: "Reply cannot be empty" });

    const reply = await Comment.create({ blog: flowId, user: userId, content, parent: commentId });

    return res.json({ success: true, data: reply });
  } catch (error) {
    console.error("replyComment error:", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
};
