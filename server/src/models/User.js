import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: { type: Boolean, default: false },
    
    // ✅ FIXED: Renamed to match controller
    profileImage: { type: String, default: "" }, 
    coverImage: { type: String, default: "" },
    bio: { type: String, trim: true, default: "" }, // ✅ FIXED: Renamed from 'about'
    
    password: { type: String, default: null },
    role: { type: String, enum: ["USER", "MODERATOR", "ADMIN"], default: "USER" },
    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    notificationsCount: { type: Number, default: 0 },

    // Relations
    accounts: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
    likedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "BlogLike" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "CommentLike" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Follow" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Follow" }],
    reportsMade: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
    reportsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: "View" }],
    // bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bookmark" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
