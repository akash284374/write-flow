// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const uploadImage = async (filePath) => {
    const normalizedPath = path.resolve(filePath);

    try {
        console.log("📤 Uploading to Cloudinary:", normalizedPath);
        const result = await cloudinary.uploader.upload(normalizedPath, {
            folder: process.env.CLOUDINARY_FOLDER || "flexkicks",
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        });
        console.log("✅ Uploaded to Cloudinary:", result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error("❌ Cloudinary upload failed:", error);
        throw error;
    } finally {
        try {
            await fs.promises.unlink(normalizedPath);
            console.log("🗑️ Temp file deleted:", normalizedPath);
        } catch (err) {
            console.warn("⚠️ Could not delete temp file:", err.message);
        }
    }
};
