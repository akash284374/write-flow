// src/pages/Friends.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { FiUserPlus, FiUserX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Friends = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState("suggestions");
  const [suggestions, setSuggestions] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const [error, setError] = useState("");

  const userId = user?._id;

  // --------------------------------------------------
  // FETCH SUGGESTIONS
  // --------------------------------------------------
  const fetchSuggestions = async () => {
    try {
      setLoading(true);

      const res = await api.get("/follow/suggestions");

      setSuggestions(res.data.users || []);
    } catch (err) {
      console.error("Suggestions error:", err);
      setError("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH FOLLOWERS
  // --------------------------------------------------
  const fetchFollowers = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/follow/followers/${userId}`);

      setFollowers(res.data.data || []);
    } catch (err) {
      console.error("Followers error:", err);
      setError("Failed to load followers");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH FOLLOWING
  // --------------------------------------------------
  const fetchFollowing = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/follow/following/${userId}`);

      setFollowing(res.data.data || []);
    } catch (err) {
      console.error("Following error:", err);
      setError("Failed to load following");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FOLLOW / UNFOLLOW
  // --------------------------------------------------
  const toggleFollow = async (targetId) => {
    setFollowLoading((prev) => ({ ...prev, [targetId]: true }));

    try {
      await api.post(`/follow/${targetId}`);

      await Promise.all([fetchSuggestions(), fetchFollowing()]);
      await refreshUser();
    } catch (err) {
      console.error("Follow toggle error:", err);
      alert("Error updating follow status");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  // --------------------------------------------------
  // REMOVE FOLLOWER
  // --------------------------------------------------
  const removeFollower = async (id) => {
    setFollowLoading((prev) => ({ ...prev, [id]: true }));

    try {
      await api.post("/follow/remove-friend", { friendId: id });

      setFollowers((prev) => prev.filter((f) => f._id !== id));
      await refreshUser();
    } catch (err) {
      console.error("Remove follower error:", err);
      alert("Failed to remove follower");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // --------------------------------------------------
  // TRIGGER FETCH ON TAB SWITCH
  // --------------------------------------------------
  useEffect(() => {
    if (!authLoading && userId) {
      if (activeTab === "suggestions") fetchSuggestions();
      if (activeTab === "followers") fetchFollowers();
      if (activeTab === "following") fetchFollowing();
    }
  }, [activeTab, authLoading, userId]);

  if (authLoading || loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  const data =
    activeTab === "suggestions"
      ? suggestions
      : activeTab === "followers"
      ? followers
      : following;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Friends</h2>

      {/* Tabs UI */}
      <div className="flex gap-4 mb-6">
        {["suggestions", "followers", "following"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500">
          {activeTab === "suggestions"
            ? "No suggestions available."
            : activeTab === "followers"
            ? "No followers yet."
            : "Not following anyone."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((u) => (
            <div
              key={u._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
            >
              <div className="flex gap-4 items-center">
                <img
                  src={u.profileImage || `https://i.pravatar.cc/150?u=${u._id}`}
                  className="w-14 h-14 rounded-full"
                  alt="avatar"
                />
                <div>
                  <h3 className="text-lg font-bold">{u.username}</h3>
                  <p className="text-sm text-gray-500">{u.bio || "No bio"}</p>
                </div>
              </div>

              {/* BUTTONS */}
              {activeTab === "suggestions" && (
                <button
                  disabled={followLoading[u._id]}
                  onClick={() => toggleFollow(u._id)}
                  className="mt-4 w-full py-2 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2"
                >
                  {followLoading[u._id] ? "Following..." : <><FiUserPlus /> Follow</>}
                </button>
              )}

              {activeTab === "following" && (
                <button
                  disabled={followLoading[u._id]}
                  onClick={() => toggleFollow(u._id)}
                  className="mt-4 w-full py-2 bg-red-600 text-white rounded-xl"
                >
                  {followLoading[u._id] ? "Unfollowing..." : "Unfollow"}
                </button>
              )}

              {activeTab === "followers" && (
                <button
                  disabled={followLoading[u._id]}
                  onClick={() => removeFollower(u._id)}
                  className="mt-4 w-full py-2 bg-red-700 text-white rounded-xl flex items-center justify-center gap-2"
                >
                  {followLoading[u._id] ? "Removing..." : <><FiUserX /> Remove</>}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;
