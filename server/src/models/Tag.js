import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    tag: { type: String, unique: true, required: true, trim: true },
    postsCount: { type: Number, default: 0 },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        default: [], // ensures array is never undefined
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Tag", tagSchema);
