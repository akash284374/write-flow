import Follow from "../models/Follow.js";
import User from "../models/User.js";

// ==================================================
// TOGGLE FOLLOW / UNFOLLOW
// ==================================================
export const toggleFollow = async (req, res) => {
  try {
    const followerId = req.user._id;
    const followeeId = req.params.userId;

    if (followerId.toString() === followeeId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existing = await Follow.findOne({ followerId, followeeId });

    // -------------------------------------------
    // UNFOLLOW
    // -------------------------------------------
    if (existing) {
      await Follow.findByIdAndDelete(existing._id);
      return res.json({
        message: "Unfollowed",
        isFollowing: false,
      });
    }

    // -------------------------------------------
    // FOLLOW
    // -------------------------------------------
    await Follow.create({ followerId, followeeId });

    return res.json({
      message: "Followed",
      isFollowing: true,
    });

  } catch (err) {
    console.error("Toggle Follow Error:", err);

    if (err.code === 11000) {
      return res.status(200).json({
        message: "Already following",
        isFollowing: true,
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// FOLLOW SUGGESTIONS
// ==================================================
// ==================================================
// FOLLOW SUGGESTIONS (MUTUAL FOLLOW FIXED)
// ==================================================
export const getFollowSuggestions = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Users I follow
    const following = await Follow
      .find({ followerId: userId })
      .distinct("followeeId");

    // Users who follow ME (important for mutual follow!)
    const followers = await Follow
      .find({ followeeId: userId })
      .distinct("followerId");

    // EXCLUDE only:
    // - myself
    // - users I follow
    // DO NOT EXCLUDE users who follow ME (so reverse follow works)
    const exclude = [...following, userId];

    const suggestions = await User.find({
      _id: { $nin: exclude }
    }).select("_id name username bio profileImage");

    return res.json({ users: suggestions });

  } catch (err) {
    console.error("Suggestion error:", err);
    res.status(500).json({ message: "Failed to load suggestions" });
  }
};


// ==================================================
// GET FOLLOWERS OF A USER
// ==================================================
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const followers = await Follow.find({ followeeId: userId })
      .populate("followerId", "_id name username bio profileImage");

    // return only the populated user data
    const result = followers.map((f) => f.followerId);

    res.json({ data: result });

  } catch (err) {
    console.error("Followers error:", err);
    res.status(500).json({ message: "Failed to load followers" });
  }
};

// ==================================================
// GET FOLLOWING OF A USER
// ==================================================
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await Follow.find({ followerId: userId })
      .populate("followeeId", "_id name username bio profileImage");

    const result = following.map((f) => f.followeeId);

    res.json({ data: result });

  } catch (err) {
    console.error("Following error:", err);
    res.status(500).json({ message: "Failed to load following" });
  }
};

// ==================================================
// REMOVE A FOLLOWER (Remove friend)
// ==================================================
export const removeFriend = async (req, res) => {
  try {
    const followeeId = req.user._id;
    const { friendId } = req.body;

    await Follow.findOneAndDelete({
      followerId: friendId,
      followeeId,
    });

    res.json({ message: "Follower removed" });

  } catch (err) {
    console.error("Remove friend error:", err);
    res.status(500).json({ message: "Failed to remove follower" });
  }
};
