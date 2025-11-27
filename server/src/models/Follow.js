import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

followSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });

followSchema.index({ followerId: 1 });
followSchema.index({ followeeId: 1 });

export default mongoose.model("Follow", followSchema);
