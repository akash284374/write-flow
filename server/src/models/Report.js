import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issue: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
    closedById: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    reportedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reportedBlogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", default: null },
    reportedCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
