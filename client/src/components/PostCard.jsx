// src/components/PostCard.jsx
import React, { useState } from "react";

const PostCard = ({
  title = "Sample Post",
  content = "This is a post.",
  author = "Akash",
  isLiked = false,
  isBookmarked = false,
  onLike,
  onBookmark,
}) => {
  // Local states to reflect button color after action
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleLike = () => {
    setLiked((prev) => !prev);
    if (onLike) onLike();
  };

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
    if (onBookmark) onBookmark();
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 text-black dark:text-white">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">{content}</p>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Author: {author}
      </p>
      <div className="flex gap-3 mt-4">
        {/* Like Button */}
        <button
          className={`font-bold px-3 py-1 rounded ${
            liked ? "bg-red-500 text-white" : "bg-gray-300 text-black"
          }`}
          onClick={handleLike}
        >
          {liked ? "Liked" : "Like"}
        </button>
        {/* Bookmark Button */}
        <button
          className={`font-bold px-3 py-1 rounded ${
            bookmarked ? "bg-yellow-400 text-black" : "bg-gray-300 text-black"
          }`}
          onClick={handleBookmark}
        >
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>
    </div>
  );
};

export default PostCard;
