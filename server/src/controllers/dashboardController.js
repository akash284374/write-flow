import mongoose from "mongoose";
import { View, Follow, Blog, User } from "../models/index.js";

// ===== Views =====
export const getSevenDaysViews = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const count = await View.countDocuments({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    res.json({ success: count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getThirtyDaysViews = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const count = await View.countDocuments({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    res.json({ success: count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getTotalViews = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const count = await View.countDocuments({ user: userId });
    res.json({ success: count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getPerDayViews = async (req, res) => {
  try {
    const { userId, days } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const daysNumber = parseInt(days);
    const startDate = daysNumber > 0
      ? new Date(Date.now() - daysNumber * 24 * 60 * 60 * 1000)
      : undefined;

    const rawViews = await View.find({
      user: userId,
      ...(startDate && { createdAt: { $gte: startDate } }),
    }).sort({ createdAt: 1 });

    const groupedViews = rawViews.reduce((acc, view) => {
      const date = view.createdAt.toISOString().split("T")[0];
      if (!acc[date]) acc[date] = { date, totalViews: 0 };
      acc[date].totalViews += 1;
      return acc;
    }, {});

    const result = [];
    const endDate = new Date();
    const start = startDate || new Date(rawViews[0]?.createdAt || new Date());

    for (let date = new Date(start); date <= endDate; date.setDate(date.getDate() + 1)) {
      const formattedDate = date.toISOString().split("T")[0];
      result.push(groupedViews[formattedDate] || { date: formattedDate, totalViews: 0 });
    }

    res.json({ success: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ===== Followers =====
export const getSevenDaysFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const count = await Follow.countDocuments({
      followingId: userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    res.json({ success: count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getThirtyDaysFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const count = await Follow.countDocuments({
      followingId: userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    res.json({ success: count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getTotalFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const count = await Follow.countDocuments({ followingId: userId });
    res.json({ success: count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ===== Recent Blogs =====
export const getRecentBlog = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const recentBlog = await Blog.find({ user: userId }) // use user field here
      .sort({ createdAt: -1 })
      .limit(2);

    if (!recentBlog || recentBlog.length === 0) {
      return res.status(404).json({ error: "No recent flows found" });
    }

    res.json({ success: recentBlog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ===== Total Flows and Followers =====
export const getTotalFlowsAndFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const user = await User.findById(userId).select("blogs followerCount").populate("blogs");

    if (!user) return res.json({ _count: { blogs: 0 }, followerCount: 0 });

    res.json({
      _count: { blogs: user.blogs.length },
      followerCount: user.followerCount || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
