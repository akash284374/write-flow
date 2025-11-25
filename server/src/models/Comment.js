import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    // For reply system
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // ✅ Store likes as user references instead of counting
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ Computed field so frontend gets `likeCount` easily
commentSchema.virtual("likeCount").get(function () {
  return this.likes?.length || 0;
});

// ✅ Automatically fetch nested replies without storing children array
commentSchema.virtual("children", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parent",
});

// ✅ Helpful Indexes
commentSchema.index({ blog: 1 });
commentSchema.index({ parent: 1 });
commentSchema.index({ user: 1 });

export default mongoose.model("Comment", commentSchema);
