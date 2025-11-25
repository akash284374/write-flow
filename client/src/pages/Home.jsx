import React, { useEffect, useState } from "react";
import { FaBookmark, FaHeart, FaRegCommentDots } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Feed = ({ searchQuery = "" }) => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [likeStatus, setLikeStatus] = useState({});
  const [bookmarkStatus, setBookmarkStatus] = useState({});
  const [openComments, setOpenComments] = useState(null); // ✅ NEW

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/flows", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data.data)) {
        const reversed = data.data.slice().reverse();
        setPosts(reversed);
        setFilteredPosts(reversed);

        const likeMap = {};
        const bookmarkMap = {};

        reversed.forEach((post) => {
          likeMap[post._id] = post.isLiked ?? false;
          bookmarkMap[post._id] = post.isBookmarked ?? false;
        });

        setLikeStatus(likeMap);
        setBookmarkStatus(bookmarkMap);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setPosts([]);
      setFilteredPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

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

  const handleLike = async (postId) => {
    const current = likeStatus[postId] ?? false;
    setLikeStatus((prev) => ({ ...prev, [postId]: !current }));

    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? { ...post, likeCount: (post.likeCount || 0) + (current ? -1 : 1) }
          : post
      )
    );

    try {
      const res = await fetch(`http://localhost:5000/api/flows/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setLikeStatus((prev) => ({ ...prev, [postId]: data.data.isLiked }));
      }
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleBookmark = async (postId) => {
    const current = bookmarkStatus[postId] ?? false;
    setBookmarkStatus((prev) => ({ ...prev, [postId]: !current }));

    try {
      const res = await fetch(`http://localhost:5000/api/flows/${postId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setBookmarkStatus((prev) => ({ ...prev, [postId]: data.isBookmarked }));
      }
    } catch (err) {
      console.error("Bookmark failed:", err);
    }
  };

  const handleAddComment = async (postId, text) => {
    if (!text.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/flows/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });

      const updated = await res.json();
      if (res.ok) {
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        fetchPosts(); // ✅ refresh comment count & list
      }
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const toggleComments = (postId) => {
    setOpenComments(openComments === postId ? null : postId);
  };

  return (
    <div className="w-full min-h-screen px-4 md:px-6 py-8 flex flex-col gap-6">
      <div className="flex-1 space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const postId = post._id;
            const author = post.user || {};
            const avatarLetter = (author.username || "U")[0].toUpperCase();

            const isLiked = likeStatus[postId] ?? false;
            const isBookmarked = bookmarkStatus[postId] ?? false;

            return (
              <div
                key={postId}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow transition"
              >
                {/* USER */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                    {avatarLetter}
                  </div>
                  <div>
                    <p className="font-semibold">{author.username}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* CONTENT */}
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>

                {/* META */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <span>{post.comments?.length || 0} Comments</span> •
                  <span>{post.likeCount || 0} Likes</span>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-6 mb-3">
                  <button
                    onClick={() => handleLike(postId)}
                    className={`flex items-center gap-1 ${isLiked ? "text-pink-600" : "text-gray-500"}`}
                  >
                    <FaHeart /> Like
                  </button>

                  <button
                    onClick={() => handleBookmark(postId)}
                    className={`flex items-center gap-1 ${isBookmarked ? "text-yellow-500" : "text-gray-500"}`}
                  >
                    <FaBookmark /> Bookmark
                  </button>

                  <button
                    onClick={() => toggleComments(postId)}
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    <FaRegCommentDots /> Comments
                  </button>
                </div>

                {/* ✅ COLLAPSIBLE COMMENT PANEL */}
                {openComments === postId && (
                  <div className="mt-3 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                    {post.comments?.length > 0 ? (
                      post.comments.map((c) => (
                        <div key={c._id} className="text-sm">
                          <b>{c.user?.username || "User"}:</b> {c.content}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No comments yet</p>
                    )}

                    {user && (
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={commentInputs[postId] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [postId]: e.target.value }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddComment(postId, commentInputs[postId])
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center mt-20 text-gray-500">No posts found</p>
        )}
      </div>
    </div>
  );
};

export default Feed;
