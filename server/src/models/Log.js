import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // optional
    },
    type: { type: String, required: true, trim: true }, // INFO, WARN, ERROR
    message: { type: String, required: true, trim: true },
    error: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ErrorLog", // updated to match Error model name
      },
    ],
    request: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Log", logSchema);
