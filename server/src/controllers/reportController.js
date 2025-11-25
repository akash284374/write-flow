import Report from "../models/Report.js";

// 1️⃣ Report a User
export const reportUser = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: "Not authenticated" });
        const userId = req.user.id || req.user._id;

        const { reportedUserId, title, issue } = req.body;
        if (!reportedUserId || !issue) return res.status(400).json({ error: "reportedUserId and issue are required" });

        const report = await Report.create({
            title,
            issue,
            reportedUserId,
            createdBy: userId,
        });

        return res.status(201).json({ success: "User reported successfully", data: report });
    } catch (err) {
        console.error("reportUser error:", err);
        return res.status(500).json({ error: "Failed to report user" });
    }
};

// 2️⃣ Report a Flow/Blog
export const reportFlow = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: "Not authenticated" });
        const userId = req.user.id || req.user._id;

        const { reportedUserId, reportedBlogId, issue, titleOptions = [] } = req.body;
        if (!reportedUserId || !reportedBlogId || !issue) return res.status(400).json({ error: "Missing required fields" });

        const title = Array.isArray(titleOptions) ? titleOptions.filter(Boolean).join(" ") : "";

        const report = await Report.create({
            title,
            issue,
            reportedUserId,
            reportedBlogId,
            createdBy: userId,
        });

        return res.status(201).json({ success: "Flow reported successfully", data: report });
    } catch (err) {
        console.error("reportFlow error:", err);
        return res.status(500).json({ error: "Failed to report flow" });
    }
};

// 3️⃣ Report a Comment
export const reportComment = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: "Not authenticated" });
        const userId = req.user.id || req.user._id;

        const { reportedUserId, reportedCommentId, issue, titleOptions = [] } = req.body;
        if (!reportedUserId || !reportedCommentId || !issue) return res.status(400).json({ error: "Missing required fields" });

        const title = Array.isArray(titleOptions) ? titleOptions.filter(Boolean).join(" ") : "";

        const report = await Report.create({
            title,
            issue,
            reportedUserId,
            reportedCommentId,
            createdBy: userId,
        });

        return res.status(201).json({ success: "Comment reported successfully", data: report });
    } catch (err) {
        console.error("reportComment error:", err);
        return res.status(500).json({ error: "Failed to report comment" });
    }
};
