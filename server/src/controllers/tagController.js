import { Tag } from "../models/index.js";

// ✅ Get all tags, sorted by postsCount (desc)
export const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find({})
            .select("tag postsCount posts") // also return `posts` if you want
            .sort({ postsCount: -1 })
            .populate("posts", "title slug"); // only populate blog title & slug

        res.json(tags);
    } catch (err) {
        console.error("getAllTags error:", err.message);
        res.status(500).json({ error: "Failed to fetch tags" });
    }
};
