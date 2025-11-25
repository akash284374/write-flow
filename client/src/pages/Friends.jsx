// src/components/Friends.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiUserPlus, FiUserX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Friends = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("suggestions"); // "suggestions", "followers", "following"
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followLoading, setFollowLoading] = useState({});
  const [userId, setUserId] = useState(null);

  // Fetch logged-in user
  const fetchUserId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        withCredentials: true,
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setUserId(res.data.user._id || res.data.user.id);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Unable to get logged-in user.");
    }
  };

  // Fetch friend suggestions
  const fetchSuggestions = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/follow/suggestions", {
        withCredentials: true,
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setFriends(res.data.suggestions || []);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError("Failed to load friend suggestions.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch followers
  const fetchFollowers = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/follow/followers/${userId}`,
        {
          withCredentials: true,
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setFollowers(res.data.followers || []);
    } catch (err) {
      console.error("Error fetching followers:", err);
      setError("Failed to load followers.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch following
  const fetchFollowing = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/follow/following/${userId}`,
        {
          withCredentials: true,
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setFollowing(res.data.following || []);
    } catch (err) {
      console.error("Error fetching following:", err);
      setError("Failed to load following.");
    } finally {
      setLoading(false);
    }
  };

  // Follow a user
  const handleFollow = async (followeeId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [followeeId]: true }));
      await axios.post(
        "http://localhost:5000/api/follow/follow",
        { followeeId },
        {
          withCredentials: true,
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setFriends((prev) => prev.filter((f) => (f._id || f.id) !== followeeId));
      fetchFollowing();
    } catch (err) {
      console.error("Error following user:", err);
      alert(err.response?.data?.message || "Failed to follow user.");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [followeeId]: false }));
    }
  };

  // Unfollow a user
  const handleUnfollow = async (followeeId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [followeeId]: true }));
      await axios.post(
        "http://localhost:5000/api/follow/unfollow",
        { followeeId },
        {
          withCredentials: true,
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      fetchFollowing();
    } catch (err) {
      console.error("Error unfollowing user:", err);
      alert(err.response?.data?.message || "Failed to unfollow user.");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [followeeId]: false }));
    }
  };

  // Remove friend (from followers tab)
  const handleRemoveFriend = async (friendId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [friendId]: true }));
      await axios.post(
        "http://localhost:5000/api/follow/remove-friend",
        { friendId },
        {
          withCredentials: true,
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setFollowers((prev) => prev.filter((f) => (f._id || f.id) !== friendId));
    } catch (err) {
      console.error("Error removing friend:", err);
      alert(err.response?.data?.message || "Failed to remove friend.");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  // Initial fetch of userId
  useEffect(() => {
    fetchUserId();
  }, [token]);

  // Fetch data when tab changes or userId is set
  useEffect(() => {
    if (!userId) return;

    if (activeTab === "suggestions") fetchSuggestions();
    else if (activeTab === "followers") fetchFollowers();
    else fetchFollowing();
  }, [activeTab, userId]);

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  let displayList = [];
  if (activeTab === "suggestions") displayList = friends;
  else if (activeTab === "followers") displayList = followers;
  else displayList = following;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Friends</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["suggestions", "followers", "following"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-xl ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {displayList.length === 0 ? (
        <p className="text-gray-500">
          {activeTab === "suggestions"
            ? "No friend suggestions."
            : activeTab === "followers"
            ? "No followers yet."
            : "You are not following anyone."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayList.map((user) => {
            const uid = user._id || user.id;
            return (
              <div
                key={uid}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.profileImage || `https://i.pravatar.cc/150?u=${uid}`}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold">{user.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.bio || "No bio"}
                    </p>
                  </div>
                </div>

                {activeTab === "suggestions" && (
                  <button
                    disabled={followLoading[uid]}
                    onClick={() => handleFollow(uid)}
                    className={`mt-4 w-full py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
                      followLoading[uid]
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {followLoading[uid] ? "Following..." : <><FiUserPlus /> Follow</>}
                  </button>
                )}

                {activeTab === "following" && (
                  <button
                    disabled={followLoading[uid]}
                    onClick={() => handleUnfollow(uid)}
                    className={`mt-4 w-full py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
                      followLoading[uid]
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {followLoading[uid] ? "Unfollowing..." : "Unfollow"}
                  </button>
                )}

                {activeTab === "followers" && (
                  <button
                    disabled={followLoading[uid]}
                    onClick={() => handleRemoveFriend(uid)}
                    className={`mt-4 w-full py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
                      followLoading[uid]
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {followLoading[uid] ? "Removing..." : <><FiUserX /> Remove Friend</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Friends;
