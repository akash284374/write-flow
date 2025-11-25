import mongoose from "mongoose";

const errorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // optional
    },
    message: { type: String, required: true, trim: true },
    stack: { type: String, trim: true, default: "" },
    severity: {
      type: String,
      enum: ["INFO", "WARN", "ERROR"],
      required: true,
    },
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Log",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ErrorLog", errorSchema);
