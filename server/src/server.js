import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import flowRoutes from "./routes/flowRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import userDashboardRoutes from "./routes/userDashboardRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import followRoutes from "./routes/followRoutes.js"; // ✅ ADDED

dotenv.config();
const app = express();

// ---------------- CONNECT TO DATABASE ----------------
connectDB();

// ---------------- CORS ----------------
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,https://flexkicks.vercel.app")
  .split(",")
  .map(origin => origin.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ---------------- MIDDLEWARE ----------------
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------- STATIC FILES ----------------
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ---------------- REQUEST LOGGER ----------------
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) console.log("Body:", req.body);
    if (req.cookies && Object.keys(req.cookies).length > 0) console.log("Cookies:", req.cookies);
    next();
  });
}

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/flows", flowRoutes);
app.use("/api/test", testRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/user-dashboard", userDashboardRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/users", userRoutes);
app.use("/api/follow", followRoutes); // ✅ ADDED

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => res.send("🚀 API is running successfully"));

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  console.error("Error:", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
