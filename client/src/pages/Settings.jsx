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
  const [message, setMessage] = useState("");

  // ---------------- Update Profile ----------------
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
      setMessage(data.message || "Profile update failed");
    } catch (err) {
      console.error(err);
      setMessage("Server error while updating profile");
    }
  };

  // ---------------- Change Password ----------------
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill all password fields!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match!");
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
      setMessage(data.message || "Failed to change password");

      if (res.ok) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error while changing password");
    }
  };

  // ---------------- Delete Account ----------------
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone!")) return;

    try {
      const res = await fetch("http://localhost:5000/api/users/delete", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      setMessage(data.message || "Failed to delete account");

      if (res.ok) logout();
    } catch (err) {
      console.error(err);
      setMessage("Server error while deleting account");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Update Profile */}
      <form onSubmit={handleProfileUpdate} className="max-w-md space-y-6 mb-10">
        <h2 className="text-2xl font-semibold mb-2">Update Profile</h2>
        <div>
          <label className="block text-gray-300 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200"
        >
          Save Profile
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="max-w-md space-y-6 mb-10">
        <h2 className="text-2xl font-semibold mb-2">Change Password</h2>
        <div>
          <label className="block text-gray-300 mb-1">Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200"
        >
          Change Password
        </button>
      </form>

      {/* Danger Zone */}
      <div className="max-w-md">
        <h2 className="text-2xl font-semibold mb-2">Danger Zone</h2>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Delete Account
        </button>
      </div>

      {message && <p className="text-green-400 mt-6">{message}</p>}
    </div>
  );
}
