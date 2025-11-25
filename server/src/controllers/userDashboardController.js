// server/src/controllers/userdashboardController.js
import { User, Blog, BlogLike, View, Tag } from "../models/index.js";

/**
 * Get user history data
 */
export const getHistoryData = async (userId) => {
    try {
        const historyData = await View.find({ userId })
            .populate({
                path: "blogId",
                strictPopulate: false, // allow non-strict populate
                populate: [
                    { path: "userId", select: "-password" }, // <-- use userId
                    { path: "tags" }
                ]
            })
            .lean();

        // Map to return 'blog' instead of 'blogId'
        return historyData.map(item => ({
            _id: item._id,
            userId: item.userId,
            blog: item.blogId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }));
    } catch (err) {
        console.error("getHistoryData error:", err.message);
        return [];
    }
};




/**
 * Get user bookmarks
 */
export const getBookmarkData = async (userId) => {
    try {
        const userWithBookmarks = await User.findById(userId)
            .populate({
                path: "bookmarks",
                populate: [
                    { path: "user", select: "-password" },
                    { path: "tags" }
                ]
            })
            .lean();
        return userWithBookmarks;
    } catch (err) {
        console.error("getBookmarkData error:", err.message);
        return null;
    }
};

/**
 * Get liked blogs
 */
export const getLikedData = async (userId) => {
    try {
        const likedData = await BlogLike.find({ userId })
            .populate({
                path: "blog",
                populate: [
                    { path: "user", select: "-password" },
                    { path: "tags" }
                ]
            })
            .lean();
        return likedData;
    } catch (err) {
        console.error("getLikedData error:", err.message);
        return [];
    }
};

/**
 * Get published blogs by user
 */
export const getPublishedData = async (userId) => {
    try {
        const publishedData = await Blog.find({ userId, isPublished: true })
            .populate("user", "-password")
            .populate("tags")
            .lean();
        return publishedData;
    } catch (err) {
        console.error("getPublishedData error:", err.message);
        return [];
    }
};

/**
 * Get draft blogs by user
 */
export const getDraftData = async (userId) => {
  try {
    const draftData = await Blog.find({ userId, isPublished: false })
      .populate("userId", "-password") // ✅ correct field name
      .lean();

    return draftData;
  } catch (err) {
    console.error("getDraftData error:", err.message);
    return [];
  }
};
