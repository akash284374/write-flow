// server/src/routes/testRoutes.js
import express from "express";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.post("/test-upload", upload.single("image"), (req, res) => {
  console.log("=== Multer Debug ===");
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);

  if (!req.file) {
    return res.status(400).json({ message: "No file received" });
  }

  res.json({ file: req.file, body: req.body });
});

export default router;
