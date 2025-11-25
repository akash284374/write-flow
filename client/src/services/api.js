import axios from "axios";
const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const api = axios.create({
  baseURL: baseURL.endsWith("/api") ? baseURL : `${baseURL}/api`,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json", 
  },
});
export default api;
