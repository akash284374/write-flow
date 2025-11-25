// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import FlowCard from "../components/FlowCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, token } = useAuth(); // get JWT or auth token from context
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserFlows = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/flows/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // protected route
          },
          credentials: "include", // include cookies if cookie auth
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setFlows(data.posts || []); // backend returns { posts: [...] }
      } catch (err) {
        console.error("Error fetching user flows:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFlows();
  }, [user, token]);

  // Like handler for updating local state
  const handleLike = async (id, newLiked) => {
    setFlows((prevFlows) =>
      prevFlows.map((flow) =>
        flow._id === id
          ? {
              ...flow,
              isLiked: newLiked,
              likeCount: flow.likeCount + (newLiked ? 1 : -1),
            }
          : flow
      )
    );
    try {
      await fetch(`http://localhost:5000/api/flows/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // Bookmark handler for updating local state
  const handleBookmark = async (id, newBookmarked) => {
    setFlows((prevFlows) =>
      prevFlows.map((flow) =>
        flow._id === id
          ? { ...flow, isBookmarked: newBookmarked }
          : flow
      )
    );
    try {
      await fetch(`http://localhost:5000/api/flows/${id}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Bookmark error:", err);
    }
  };

  // Add comment handler placeholder
  const handleAddComment = (id, content) => {
    // Add your comment POST logic here if needed
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-black dark:text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          Loading your flows...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-center text-red-500 dark:text-red-400 mt-4">
          {error}
        </p>
      )}

      {/* User Flows */}
      {!loading && !error && flows.length > 0 && (
        <div className="grid gap-4">
          {flows.map((flow) => (
            <FlowCard
              key={flow._id || flow.id}
              flow={flow}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onAddComment={handleAddComment}
              user={user}
            />
          ))}
        </div>
      )}

      {/* No Flows */}
      {!loading && !error && flows.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          You haven’t created any flows yet.
        </p>
      )}
    </div>
  );
}
