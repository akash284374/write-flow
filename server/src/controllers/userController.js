import User from "../models/User.js";
import About from "../models/About.js";
import Follows from "../models/Follow.js";
import mongoose from "mongoose";

// ✅ Get Following Users (full profiles)
export const getFollowingUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await Follows.find({ followerId: userId })
      .populate("followingId", "_id username name image") // _id is always present, not id
      .lean();

    if (!following) return res.status(404).json({ error: "User not found" });

    res.json({ data: following.map((f) => f.followingId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Check if already following
export const isAlreadyFollowing = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.query.currentUserId;
    const { id } = req.params;

    if (!currentUserId) {
      return res.status(400).json({ error: "Missing currentUserId" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user Id" });
    }

    const alreadyFollowing = await Follows.findOne({
      followerId: currentUserId,
      followingId: id,
    });

    res.json({ data: !!alreadyFollowing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update User About Section
export const updateUserAboutSection = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { name, bio, location, website, career } = req.body;

    if ([name, bio, location, website, career].some((field) => !field)) {
      return res.status(400).json({ error: "All fields are required" });
    }

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

    res.json({
      success: "User about section updated successfully",
      user: userUpdate,
      about: aboutUpdate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Follow / Unfollow Toggle
export const followToggle = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user Id" });
    }
    if (currentUserId.toString() === id.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself!" });
    }

    const alreadyFollowing = await Follows.findOne({
      followerId: currentUserId,
      followingId: id,
    });

    if (alreadyFollowing) {
      // Unfollow
      await Follows.deleteOne({ _id: alreadyFollowing._id });

      await User.findByIdAndUpdate(currentUserId, {
        $inc: { followingCount: -1 },
      });
      await User.findByIdAndUpdate(id, { $inc: { followerCount: -1 } });

      return res.json({
        success: "User unfollowed successfully",
        data: false,
      });
    } else {
      // Follow
      await Follows.create({
        followerId: currentUserId,
        followingId: id,
      });

      await User.findByIdAndUpdate(currentUserId, {
        $inc: { followingCount: 1 },
      });
      await User.findByIdAndUpdate(id, { $inc: { followerCount: 1 } });

      return res.json({
        success: "User followed successfully",
        data: true,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Followers
export const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    const followers = await Follows.find({ followingId: id })
      .populate("followerId", "_id username name image")
      .sort({ createdAt: -1 });

    res.json({ data: followers.map((f) => f.followerId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Following
export const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    const following = await Follows.find({ followerId: id })
      .populate("followingId", "_id username name image")
      .sort({ createdAt: -1 });

    res.json({ data: following.map((f) => f.followingId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTopUsers = async (req, res) => {
  try {
    const { filter = "" } = req.query;

    const users = await User.find({
      $or: [
        { name: { $regex: filter, $options: "i" } },
        { username: { $regex: filter, $options: "i" } },
      ],
    })
      .sort({ followerCount: -1 })
      .limit(5)
      .select("_id username name image followerCount");

    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get users that current user is following
    const following = await Follows.find({ followerId: currentUserId }).distinct("followingId");

    const users = await User.find()
      .select("_id username name bio profileImage");

    const formattedUsers = users.map((u) => ({
      ...u._doc,
      isFollowing: following.includes(u._id.toString()),
    })).filter(u => u._id.toString() !== currentUserId.toString()); // ✅ remove yourself

    res.json({ users: formattedUsers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
