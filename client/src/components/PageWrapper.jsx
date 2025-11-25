// src/components/PageWrapper.jsx
import React from "react";
import { Link } from "react-router-dom";

const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen p-4 bg-white dark:bg-[#0f0f0f] text-black dark:text-white">
      {/* Back link */}
      <div className="mb-4">
        <Link
          to="/"
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Page content */}
      <div>{children}</div>
    </div>
  );
};

export default PageWrapper;
