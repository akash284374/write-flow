import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ensures one About document per user
    },
    bio: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    career: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("About", aboutSchema);
