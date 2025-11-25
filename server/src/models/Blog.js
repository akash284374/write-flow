import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    content: {
      type: String,
    },

    jsonContent: {
      type: Object,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
    },

    thumbnail: {
      type: String,
    },

    coverImage: {
      type: String,
    },

    isCommentOff: {
      type: Boolean,
      default: false,
    },

    likeCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  { timestamps: true }
);

// ✅ Indexing for faster searches and text-based filtering
blogSchema.index({
  title: "text",
  description: "text",
  tags: 1,
});

export default mongoose.model("Blog", blogSchema);
