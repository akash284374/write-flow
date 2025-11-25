import { Link } from "react-router-dom"; // For routing
import { useState } from "react";

const ErrorCard = () => {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-[400px] bg-white rounded-lg shadow-md p-6 flex flex-col items-center space-y-4">
                {/* Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M12 5c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z"
                    />
                </svg>

                {/* Text */}
                <h2 className="text-2xl font-bold">Login</h2>
                <p className="text-gray-600 text-center">Oops! Something went wrong!</p>

                {/* Button */}
                <Link to="/login" className="w-full">
                    <button className="w-full py-2 rounded border border-black bg-white text-black font-semibold hover:bg-gray-100">
                        Go Back To Login
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default ErrorCard;
