// backend/config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
      {
        dbName: "WriteFlow",
        appName: "Cluster0",
        
      }
    );
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
