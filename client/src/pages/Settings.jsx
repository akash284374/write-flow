// src/pages/SettingsPage.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ⚠️ Separate messages
  const [profileMsg, setProfileMsg] = useState("");
  const [profileMsgType, setProfileMsgType] = useState("success");

  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordMsgType, setPasswordMsgType] = useState("success");

  const showProfileMsg = (msg, type = "success") => {
    setProfileMsg(msg);
    setProfileMsgType(type);
    setTimeout(() => setProfileMsg(""), 3000);
  };

  const showPasswordMsg = (msg, type = "success") => {
    setPasswordMsg(msg);
    setPasswordMsgType(type);
    setTimeout(() => setPasswordMsg(""), 3000);
  };

  /* =============================================
        UPDATE PROFILE
  ============================================= */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        showProfileMsg(data.error || "Failed to update profile", "error");
        return;
      }

      showProfileMsg("Profile updated successfully!", "success");
    } catch (err) {
      showProfileMsg("Server error", "error");
    }
  };

  /* =============================================
        CHANGE PASSWORD
  ============================================= */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      showPasswordMsg("Fill all fields!", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showPasswordMsg("New and confirm password mismatch!", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        showPasswordMsg(data.error || "Incorrect old password!", "error");
        return;
      }

      showPasswordMsg("Password changed successfully!", "success");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showPasswordMsg("Server error", "error");
    }
  };

  /* =============================================
        DELETE ACCOUNT
  ============================================= */
  const handleDeleteAccount = async () => {
    if (!window.confirm("This cannot be undone. Continue?")) return;

    try {
      const res = await fetch("http://localhost:5000/api/users/delete", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        showProfileMsg(data.error || "Delete failed", "error");
        return;
      }

      logout();
    } catch (err) {
      showProfileMsg("Server error", "error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* ================= PROFILE UPDATE ================= */}
      <form onSubmit={handleProfileUpdate} className="max-w-md space-y-6 mb-10">

        <h2 className="text-2xl font-semibold mb-2">Update Profile</h2>

        {/* PROFILE MESSAGE BELOW HEADING */}
        {profileMsg && (
          <div
            className={`px-4 py-3 rounded-md text-white ${
              profileMsgType === "error" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {profileMsg}
          </div>
        )}

        <div>
          <label className="block text-gray-300 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white"
          />
        </div>

        <button className="bg-white text-black px-4 py-2 rounded-md">
          Save Profile
        </button>
      </form>

      {/* ================= CHANGE PASSWORD ================= */}
      <form onSubmit={handleChangePassword} className="max-w-md space-y-6 mb-10">

        <h2 className="text-2xl font-semibold mb-2">Change Password</h2>

        {/* PASSWORD MESSAGE BELOW HEADING */}
        {passwordMsg && (
          <div
            className={`px-4 py-3 rounded-md text-white ${
              passwordMsgType === "error" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {passwordMsg}
          </div>
        )}

        <div>
          <label className="block text-gray-300 mb-1">Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white"
          />
        </div>

        <button className="bg-white text-black px-4 py-2 rounded-md">
          Change Password
        </button>
      </form>

      {/* ================= DELETE ACCOUNT ================= */}
      <div className="max-w-md">
        <h2 className="text-2xl font-semibold mb-2">Danger Zone</h2>

        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
