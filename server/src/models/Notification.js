import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    redirect: {
      type: String,
      trim: true,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Optional index for faster unread lookups
notificationSchema.index({ userId: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);
