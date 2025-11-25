// src/components/Navbar.jsx
import React from "react";
import { FaSun, FaMoon, FaSearch, FaUserCircle } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white sticky top-0 z-50">
      {/* Left: Logo */}
      <Link to="/" className="text-2xl font-bold tracking-wide">
        Quill
      </Link>

      {/* Center: Search bar (hidden on small screens) */}
      <div className="relative w-full max-w-md mx-6 hidden sm:block">
        <input
          type="text"
          placeholder="Search by title or username..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <FaSearch className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400" />
      </div>

      {/* Right: Icons */}
      <div className="flex items-center space-x-4">
        {/* Home Button (if not on Home page) */}
        {!isHome && (
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
          >
            Home
          </Link>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>

        {/* Profile Link */}
        <Link
          to="/profile/me"
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Profile"
        >
          <FaUserCircle size={24} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
