import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // optional
    },
    method: { type: String, required: true, trim: true }, // GET, POST, PUT...
    path: { type: String, required: true, trim: true },
    statusCode: { type: Number, required: true },
    duration: { type: Number, default: null }, // in ms
    ip: { type: String, trim: true, default: null },
    userAgent: { type: String, trim: true, default: null },
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Log",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);
