// src/pages/Feed.jsx
import React, { useEffect, useState } from "react";
import { FaBookmark, FaHeart, FaRegCommentDots } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Feed = ({ searchQuery = "" }) => {
  const { user, token } = useAuth();

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [comments, setComments] = useState({});
  const [likeStatus, setLikeStatus] = useState({});
  const [bookmarkStatus, setBookmarkStatus] = useState({});
  const [openComments, setOpenComments] = useState(null);

  /* ---------------------------------------------------
    FETCH POSTS
  -----------------------------------------------------*/
  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/flows", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data.data)) {
        setPosts(data.data); // ❗ FIX: no reverse()

        const likeMap = {};
        const bookmarkMap = {};

        data.data.forEach((post) => {
          likeMap[post._id] = post.isLiked ?? false;
          bookmarkMap[post._id] = post.isBookmarked ?? false;
        });

        setLikeStatus(likeMap);
        setBookmarkStatus(bookmarkMap);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  /* ---------------------------------------------------
    SYNC filteredPosts WHEN posts CHANGE (VERY IMPORTANT)
  -----------------------------------------------------*/
  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

  /* ---------------------------------------------------
    SEARCH FILTER
  -----------------------------------------------------*/
  useEffect(() => {
    if (!searchQuery.trim()) return setFilteredPosts(posts);

    const q = searchQuery.toLowerCase();
    setFilteredPosts(
      posts.filter(
        (post) =>
          post.title?.toLowerCase().includes(q) ||
          post.user?.username?.toLowerCase().includes(q) ||
          post.content?.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, posts]);

  /* ---------------------------------------------------
    FETCH COMMENTS
  -----------------------------------------------------*/
  const fetchComments = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/flows/${postId}/comments`);
      const data = await res.json();

      if (res.ok) {
        setComments((prev) => ({ ...prev, [postId]: data.data || [] }));
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const toggleComments = (postId) => {
    if (openComments === postId) setOpenComments(null);
    else {
      setOpenComments(postId);
      fetchComments(postId);
    }
  };

  /* ---------------------------------------------------
    LIKE (FULLY FIXED)
  -----------------------------------------------------*/
  const handleLike = async (postId) => {
    if (!user) return alert("Login to like posts");

    try {
      const res = await fetch(`http://localhost:5000/api/flows/${postId}/like`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        const { likeCount, isLiked } = data.data;

        // update likeStatus (color)
        setLikeStatus((prev) => ({ ...prev, [postId]: isLiked }));

        // update posts count
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, likeCount } : post
          )
        );

        // update filteredPosts count (UI rendering source)
        setFilteredPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, likeCount } : post
          )
        );
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  /* ---------------------------------------------------
    BOOKMARK
  -----------------------------------------------------*/
  const handleBookmark = async (postId) => {
    if (!user) return alert("Login to bookmark");

    const current = bookmarkStatus[postId] ?? false;
    setBookmarkStatus((prev) => ({ ...prev, [postId]: !current }));

    await fetch(`http://localhost:5000/api/flows/${postId}/bookmark`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      credentials: "include",
    });
  };

  /* ---------------------------------------------------
    ADD COMMENT
  -----------------------------------------------------*/
  const handleAddComment = async (postId, text) => {
    if (!user) return alert("Login to comment");
    if (!text.trim()) return;

    await fetch(`http://localhost:5000/api/flows/${postId}/comments`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ content: text }),
    });

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    fetchComments(postId);
  };

  /* ---------------------------------------------------
    REPLY
  -----------------------------------------------------*/
  const handleReply = async (postId, commentId, text) => {
    if (!user) return alert("Login to reply");
    if (!text.trim()) return;

    await fetch(
      `http://localhost:5000/api/flows/${postId}/comments/${commentId}/reply`,
      {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      }
    );

    setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    fetchComments(postId);
  };

  /* ---------------------------------------------------
    LIKE COMMENT
  -----------------------------------------------------*/
  const handleLikeComment = async (commentId, postId) => {
    if (!user) return alert("Login to like comments");

    await fetch(`http://localhost:5000/api/flows/comments/${commentId}/like`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      credentials: "include",
    });

    fetchComments(postId);
  };

  /* ---------------------------------------------------
    DELETE COMMENT
  -----------------------------------------------------*/
  const handleDeleteComment = async (commentId, postId) => {
    if (!user) return;

    await fetch(`http://localhost:5000/api/flows/${postId}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      credentials: "include",
    });

    fetchComments(postId);
  };

  /* ---------------------------------------------------
    RENDER COMMENTS
  -----------------------------------------------------*/
  const renderComments = (postId, list, level = 0) =>
    list.map((c) => {
      const commentUserId =
        typeof c.user === "string" ? c.user : c.user?._id;
      const loggedInUserId = user?._id;

      const canDelete =
        loggedInUserId &&
        commentUserId &&
        loggedInUserId.toString() === commentUserId.toString();

      return (
        <div key={c._id} className="mt-2" style={{ marginLeft: level * 20 }}>
          <div className="flex justify-between items-center">
            <p className="text-sm">
              <b>{c.user?.username || "User"}:</b> {c.content}
            </p>

            {canDelete && (
              <button
                className="text-xs text-red-500 hover:underline ml-2"
                onClick={() => handleDeleteComment(c._id, postId)}
              >
                Delete
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 my-1">
            <button
              onClick={() => user && handleLikeComment(c._id, postId)}
              className={`hover:text-pink-600 flex items-center gap-1 ${!user ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={!user}
            >
              <FaHeart
                className={
                  c.likes?.includes(loggedInUserId)
                    ? "text-pink-500"
                    : ""
                }
              />
              {c.likes?.length || 0}
            </button>

            {user ? (
              <input
                type="text"
                placeholder="Reply..."
                className="text-xs p-1 border rounded"
                value={replyInputs[c._id] || ""}
                onChange={(e) =>
                  setReplyInputs((prev) => ({
                    ...prev,
                    [c._id]: e.target.value,
                  }))
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleReply(postId, c._id, replyInputs[c._id])
                }
              />
            ) : (
              <p className="text-gray-400 text-xs">Login to reply</p>
            )}
          </div>

          {c.children &&
            c.children.length > 0 &&
            renderComments(postId, c.children, level + 1)}
        </div>
      );
    });

  /* ---------------------------------------------------
    RENDER FEED
  -----------------------------------------------------*/
  return (
    <div className="w-full min-h-screen px-4 md:px-6 py-8 flex flex-col gap-6">
      {filteredPosts.map((post) => {
        const postId = post._id;
        const author = post.user || {};
        const avatarLetter = (author.username || "U")[0].toUpperCase();

        const isLiked = likeStatus[postId] ?? false;
        const isBookmarked = bookmarkStatus[postId] ?? false;

        return (
          <div
            key={postId}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow"
          >
            {/* AUTHOR */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                {avatarLetter}
              </div>
              <p className="font-semibold">{author.username}</p>
            </div>

            {/* TITLE */}
            <h2 className="text-xl dark:text-yellow-400 font-bold mb-1">{post.title}</h2>

            {/* DESCRIPTION */}
            {post.description && (
              <p className="text-gray-500 dark:text-green-400 mb-2">
                {post.description}
              </p>
            )}

            {/* CONTENT */}
            {post.content && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {post.content}
              </p>
            )}


            {/* COUNTS */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
              <span>{post.commentCount || 0} Comments</span> •
              <span>{post.likeCount || 0} Likes</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-6 mb-3">
              {/* LIKE */}
              <button
                onClick={() => user && handleLike(postId)}
                disabled={!user}
                className={`flex items-center gap-1 ${isLiked ? "text-pink-600" : "text-gray-500"
                  } ${!user ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <FaHeart /> Like
              </button>

              {/* BOOKMARK */}
              <button
                onClick={() => user && handleBookmark(postId)}
                disabled={!user}
                className={`flex items-center gap-1 ${isBookmarked ? "text-yellow-500" : "text-gray-500"
                  } ${!user ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <FaBookmark /> Bookmark
              </button>

              {/* COMMENT BUTTON */}
              <button
                onClick={() => toggleComments(postId)}
                className="flex items-center gap-1 hover:text-blue-500"
              >
                <FaRegCommentDots /> Comments
              </button>
            </div>

            {/* COMMENTS SECTION */}
            {openComments === postId && (
              <div className="mt-3 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg space-y-3">
                {renderComments(postId, comments[postId] || [])}

                {user ? (
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={commentInputs[postId] || ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [postId]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      handleAddComment(postId, commentInputs[postId])
                    }
                  />
                ) : (
                  <p className="text-gray-400 text-sm">Login to comment</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Feed;
