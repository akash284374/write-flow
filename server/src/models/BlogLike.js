import mongoose from "mongoose";

const blogLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Ensure a user can like a specific blog only once
blogLikeSchema.index({ user: 1, blog: 1 }, { unique: true });

export default mongoose.model("BlogLike", blogLikeSchema);
