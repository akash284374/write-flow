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
    timestamps: { createdAt: true, updatedAt: false }, // only track createdAt
  }
);

// Prevent duplicate follows (same as @@unique in Prisma)
followSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });

export default mongoose.model("Follow", followSchema);
