import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes — supports token from cookies or Authorization header.
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1️⃣ Try to get token from cookies
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // 2️⃣ Or from Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 3️⃣ If no token found
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    // 4️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
      });
    }

    // 5️⃣ Find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // 6️⃣ Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
