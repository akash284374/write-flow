// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaUser,
  FaPen,
  FaUserFriends,
  FaSearch,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout, loading, isAuthenticated } = useAuth();

  // Show placeholder while checking authentication
  if (loading) {
    return (
      <div className="w-64 h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        Checking login...
      </div>
    );
  }

  // If user is not logged in
  if (!isAuthenticated) {
    return (
      <div className="w-64 h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center border-r border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center px-4">
          Login to see the full sidebar
        </p>
      </div>
    );
  }

  const profileId = user?.username || user?._id || "me";

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col justify-between px-6 py-8 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
      {/* Top Section */}
      <div className="space-y-6">
        <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-wide">
          Quill
        </div>

        <SidebarItem icon={<FaHome />} label="Feed" to="/feed" active={pathname === "/feed"} />
        <SidebarItem icon={<FaUser />} label="Profile" to={`/profile/${profileId}`} active={pathname.startsWith("/profile")} />
        <SidebarItem icon={<FaPen />} label="Create Flow" to="/create" active={pathname === "/create"} />
        <SidebarItem icon={<FaUserFriends />} label="Friends" to="/friends" active={pathname === "/friends"} />
        <SidebarItem icon={<FaSearch />} label="Search Users" to="/search" active={pathname === "/search"} />
        <SidebarItem icon={<FaChartBar />} label="Dashboard" to="/dashboard" active={pathname === "/dashboard"} />
        <SidebarItem icon={<FaCog />} label="Settings" to="/settings" active={pathname === "/settings"} />
      </div>

      {/* Bottom Section (Logout) */}
      <div>
        <SidebarItem icon={<FaSignOutAlt />} label="Logout" onClick={logout} />
      </div>
    </div>
  );
};

// SidebarItem handles both links and buttons
const SidebarItem = ({ icon, label, to, active, onClick }) => {
  const baseClasses = "flex items-center gap-4 px-3 py-2 rounded-lg transition duration-200";
  const activeClasses = "bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-semibold";
  const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700";

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${inactiveClasses} w-full text-left`}
      >
        <div className="text-xl">{icon}</div>
        <div className="text-base truncate">{label}</div>
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      <div className="text-xl">{icon}</div>
      <div className="text-base truncate">{label}</div>
    </Link>
  );
};

export default Sidebar;
