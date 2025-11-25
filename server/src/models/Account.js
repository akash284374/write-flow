import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ensures one account per user
    },
    type: { type: String, trim: true },
    provider: { type: String, trim: true },
    providerAccountId: { type: String, trim: true },
    refreshToken: { type: String, trim: true },
    accessToken: { type: String, trim: true },
    expiresAt: { type: Number },
    tokenType: { type: String, trim: true },
    scope: { type: String, trim: true },
    idToken: { type: String, trim: true },
    sessionState: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);
