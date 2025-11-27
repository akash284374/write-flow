import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1️⃣ Check cookie
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // 2️⃣ Check Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // 3️⃣ Decode the token safely
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
      });
    }

    // 4️⃣ Extract the correct ID field (supports ALL formats)
    const userId =
      decoded.userId || decoded.id || decoded._id || decoded.uid;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    // 5️⃣ Find the user
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // 6️⃣ Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("Protect Middleware Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
