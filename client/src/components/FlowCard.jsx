import React, { useState, useEffect } from "react";
import { FaRegCommentDots, FaHeart, FaBookmark, FaEye } from "react-icons/fa";

const FlowCard = ({
  _id,
  title = "Untitled",
  description = "",
  content = "",
  createdAt,
  comments = [],
  isLiked = false,
  isBookmarked = false,
  likeCount = 0,
  viewCount = 0,
  user,
  onLike,
  onBookmark,
  onAddComment,
}) => {

  const [commentInput, setCommentInput] = useState("");
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);

  useEffect(() => {
    setLocalLiked(isLiked);
    setLocalBookmarked(isBookmarked);
    setLocalLikeCount(likeCount);
  }, [isLiked, isBookmarked, likeCount]);

  const handleLike = async () => {
    const newLiked = !localLiked;
    setLocalLiked(newLiked);
    setLocalLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      await onLike?.(_id, newLiked);
    } catch (err) {
      setLocalLiked(!newLiked);
      setLocalLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const handleBookmark = async () => {
    const newState = !localBookmarked;
    setLocalBookmarked(newState);

    try {
      await onBookmark?.(_id, newState);
    } catch (err) {
      setLocalBookmarked(!newState);
    }
  };

  // Show first 150 chars of content
  const contentPreview =
    content.length > 150 ? content.slice(0, 150) + "..." : content;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 mb-4 border border-gray-200 dark:border-gray-800">

      <h2 className="text-xl font-semibold mb-1">{title}</h2>

      {/* DESCRIPTION */}
      {description && (
        <p className="text-md text-gray-400 dark:text-gray-300 mb-2">
          {description}
        </p>
      )}

      {/* CONTENT PREVIEW */}
      <p className="text-gray-700 dark:text-gray-300 mb-3">
        {contentPreview}
      </p>

      {/* DATE */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {new Date(createdAt).toLocaleDateString()}
      </p>

      {/* Actions */}
      <div className="flex justify-between items-center text-sm dark:text-gray-400 mb-2">

        <span className="flex items-center gap-1"><FaEye /> {viewCount}</span>

        <button
          onClick={handleLike}
          className={`flex items-center gap-1 transition ${
            localLiked ? "text-pink-600" : "hover:text-pink-600"
          }`}
        >
          <FaHeart /> {localLikeCount}
        </button>

        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1 transition ${
            localBookmarked ? "text-yellow-500" : "hover:text-yellow-500"
          }`}
        >
          <FaBookmark />
        </button>

        <span className="flex items-center gap-1">
          <FaRegCommentDots /> {comments.length}
        </span>
      </div>

      {/* Comments Preview */}
      {comments.length > 0 && (
        <div className="max-h-40 overflow-y-auto pr-2 space-y-2 border border-gray-300 dark:border-gray-700 rounded-md p-2 mb-2">
          {comments.map((c, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold">
                {c.user?.username || "User"}:
              </span>{" "}
              {c.content || c.text || c}
            </div>
          ))}
        </div>
      )}

      {/* Add Comment */}
      {user && (
        <input
          type="text"
          placeholder="Add a comment..."
          className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white mt-2"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && commentInput.trim()) {
              await onAddComment?.(_id, commentInput);
              setCommentInput("");
            }
          }}
        />
      )}
    </div>
  );
};

export default FlowCard;
