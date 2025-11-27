import User from "../models/User.js";
import About from "../models/About.js";
import Follow from "../models/Follow.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* =====================================================
   GET USERS YOU ARE FOLLOWING
===================================================== */
export const getFollowingUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await Follow.find({ followerId: userId })
      .populate("followeeId", "_id username name bio profileImage")
      .lean();

    return res.json({ data: following.map((f) => f.followeeId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   CHECK IF ALREADY FOLLOWING
===================================================== */
export const isAlreadyFollowing = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid user ID" });

    const exists = await Follow.findOne({
      followerId: currentUserId,
      followeeId: id,
    });

    return res.json({ isFollowing: !!exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   UPDATE PROFILE (username + email)
===================================================== */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, email } = req.body;

    if (!username || !email)
      return res.status(400).json({ error: "Username and Email required" });

    const updated = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true }
    ).select("_id username email profileImage");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
};

/* =====================================================
   UPDATE ABOUT SECTION
===================================================== */
export const updateUserAboutSection = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio, location, website, career } = req.body;

    const userUpdate = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    );

    const aboutUpdate = await About.findOneAndUpdate(
      { userId },
      { bio, location, website, career },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "About updated",
      user: userUpdate,
      about: aboutUpdate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   CHANGE PASSWORD
===================================================== */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ error: "All fields required" });

    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    return res.json({ success: true, message: "Password changed" });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =====================================================
   FOLLOW / UNFOLLOW TOGGLE
===================================================== */
export const followToggle = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const { id } = req.params;

    if (currentUserId === id)
      return res.status(400).json({ error: "You cannot follow yourself" });

    const existing = await Follow.findOne({
      followerId: currentUserId,
      followeeId: id,
    });

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });

      await User.findByIdAndUpdate(currentUserId, {
        $inc: { followingCount: -1 },
      });
      await User.findByIdAndUpdate(id, {
        $inc: { followerCount: -1 },
      });

      return res.json({ success: true, isFollowing: false });
    }

    await Follow.create({
      followerId: currentUserId,
      followeeId: id,
    });

    await User.findByIdAndUpdate(currentUserId, {
      $inc: { followingCount: 1 },
    });
    await User.findByIdAndUpdate(id, {
      $inc: { followerCount: 1 },
    });

    return res.json({ success: true, isFollowing: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET FOLLOWERS
===================================================== */
export const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    const followers = await Follow.find({ followeeId: id })
      .populate("followerId", "_id username name bio profileImage")
      .sort({ createdAt: -1 });

    return res.json({ data: followers.map((f) => f.followerId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET FOLLOWING
===================================================== */
export const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    const following = await Follow.find({ followerId: id })
      .populate("followeeId", "_id username name bio profileImage")
      .sort({ createdAt: -1 });

    return res.json({ data: following.map((f) => f.followeeId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET TOP USERS
===================================================== */
export const getTopUsers = async (req, res) => {
  try {
    const { filter = "" } = req.query;

    const regex = new RegExp(filter, "i");

    const users = await User.find({
      $or: [{ name: regex }, { username: regex }],
    })
      .sort({ followerCount: -1 })
      .limit(5)
      .select("_id username name profileImage followerCount");

    return res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET ALL USERS + isFollowing
===================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    const following = await Follow.find({ followerId: currentUserId })
      .distinct("followeeId");

    const followingIds = following.map((id) => id.toString());

    const users = await User.find().select(
      "_id username name bio profileImage"
    );

    const formatted = users
      .map((u) => ({
        ...u._doc,
        isFollowing: followingIds.includes(u._id.toString()),
      }))
      .filter((u) => u._id.toString() !== currentUserId);

    return res.json({ users: formatted });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete User
    await User.findByIdAndDelete(userId);

    // Delete About info
    await About.deleteOne({ userId });

    // Delete all follow relationships
    await Follow.deleteMany({
      $or: [{ followerId: userId }, { followeeId: userId }],
    });

    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("deleteAccount error:", err);
    return res.status(500).json({ error: "Failed to delete account" });
  }
};
