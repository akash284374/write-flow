import Follow from "../models/Follow.js";
import User from "../models/User.js";

// ✅ Toggle Follow/Unfollow
export const toggleFollow = async (req, res) => {
  try {
    const followerId = req.user._id;
    const followeeId = req.params.userId;

    if (followerId.toString() === followeeId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existing = await Follow.findOne({ followerId, followeeId });

    if (existing) {
      await Follow.findByIdAndDelete(existing._id);
      return res.json({ message: "Unfollowed", isFollowing: false });
    }

    await Follow.create({ followerId, followeeId });
    return res.json({ message: "Followed", isFollowing: true });

  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Already following" });
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Friend Suggestions (people you don’t follow yet)
export const getFollowSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const following = await Follow.find({ followerId: userId }).distinct("followeeId");

    const suggestions = await User.find({
      _id: { $nin: [...following, userId] }
    }).select("_id username bio profileImage");

    res.json({ suggestions });
  } catch {
    res.status(500).json({ message: "Failed to load suggestions" });
  }
};

// ✅ Followers (who follows YOU)
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const followers = await Follow.find({ followeeId: userId })
      .populate("followerId", "_id username bio profileImage");

    res.json({ followers: followers.map(f => f.followerId) });
  } catch {
    res.status(500).json({ message: "Failed to load followers" });
  }
};

// ✅ Following (who YOU follow)
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await Follow.find({ followerId: userId })
      .populate("followeeId", "_id username bio profileImage");

    res.json({ following: following.map(f => f.followeeId) });
  } catch {
    res.status(500).json({ message: "Failed to load following" });
  }
};

// ✅ Remove a follower (Block / Remove connection)
export const removeFriend = async (req, res) => {
  try {
    const followeeId = req.user._id;
    const { friendId } = req.body;

    await Follow.findOneAndDelete({ followerId: friendId, followeeId });
    res.json({ message: "Removed follower successfully" });
  } catch {
    res.status(500).json({ message: "Failed to remove follower" });
  }
};


// export const toggleFollow = async (req, res) => {
//   try {
//     const followerId = req.user._id;
//     const followeeId = req.params.userId;

//     if (followerId.toString() === followeeId)
//       return res.status(400).json({ message: "You cannot follow yourself" });

//     const existing = await Follow.findOne({ followerId, followeeId });

//     if (existing) {
//       await Follow.findByIdAndDelete(existing._id);
//       return res.json({ message: "Unfollowed", isFollowing: false });
//     }

//     await Follow.create({ followerId, followeeId });
//     res.json({ message: "Followed", isFollowing: true });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };
