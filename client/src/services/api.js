import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// 🔥 ALWAYS remove trailing slash and /api
const cleanBaseURL = backendURL.replace(/\/+$/, "").replace(/\/api$/, "");

console.log("🔗 USING BACKEND URL:", cleanBaseURL + "/api");

const api = axios.create({
  baseURL: cleanBaseURL + "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
