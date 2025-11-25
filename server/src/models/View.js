import mongoose from "mongoose";

const viewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only view a blog once
viewSchema.index({ userId: 1, blogId: 1 }, { unique: true });

export default mongoose.model("View", viewSchema);
