// server/src/controllers/settingController.js
import bcrypt from "bcryptjs";
import { User, Blog } from "../models/index.js";

/**
 * Update personal info
 */
export const personalInfoUpdate = async (req, res) => {
    try {
        const { name, username, email, about } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, username, email, about },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ success: "Profile updated successfully", user: updatedUser });
    } catch (err) {
        console.error("Error updating profile:", err.message);
        res.status(500).json({ error: "Server error while updating profile" });
    }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (!user.password) return res.status(400).json({ error: "User does not have a password" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: "Password updated successfully" });
    } catch (err) {
        console.error("Error changing password:", err.message);
        res.status(500).json({ error: "Server error while updating password" });
    }
};

/**
 * Set password (for users created via social login)
 */
export const setPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ error: "Password is required" });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.password) return res.status(400).json({ error: "Password already set" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: "Password set successfully" });
    } catch (err) {
        console.error("Error setting password:", err.message);
        res.status(500).json({ error: "Server error while setting password" });
    }
};

/**
 * Delete account
 */
export const deleteAccount = async (req, res) => {
    try {
        const { password, confirm } = req.body;
        if (!confirm) return res.status(400).json({ error: "You must confirm account deletion" });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (!user.password) return res.status(400).json({ error: "Cannot delete account without password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Password is incorrect" });

        await User.findByIdAndDelete(req.user._id);

        res.clearCookie("token"); // clear auth cookie
        res.json({ success: "Account deleted successfully" });
    } catch (err) {
        console.error("Error deleting account:", err.message);
        res.status(500).json({ error: "Server error while deleting account" });
    }
};

/**
 * Edit flow (publish/unpublish blog)
 */
export const editFlow = async (req, res) => {
    try {
        const { flowId, isPublished } = req.body;

        if (!flowId) return res.status(400).json({ error: "Flow ID is required" });

        const blog = await Blog.findOneAndUpdate(
            { _id: flowId, userId: req.user._id }, // <-- use userId
            { isPublished: !isPublished },
            { new: true }
        );


        if (!blog) return res.status(404).json({ error: "Flow not found" });

        res.json({ success: "Flow updated successfully", blog });
    } catch (err) {
        console.error("Error editing flow:", err.message);
        res.status(500).json({ error: "Server error while updating flow" });
    }
};
