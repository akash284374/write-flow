import React, { useState, useEffect } from "react";
import { FiUserPlus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext"; // ✅ get logged user

const SearchUser = ({ searchQuery = "" }) => {
  const { user } = useAuth(); // ✅ logged in user
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);
      } else {
        console.error(data.message || "Failed to load users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter((u) => u.username?.toLowerCase().includes(q))
      );
    }
  }, [searchQuery, users]);

  // ✅ Follow / Unfollow Toggle
  const handleFollow = async (targetUserId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/follow/${targetUserId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok) {
        // ✅ Update UI instantly (toggle follow state)
        setUsers((prev) =>
          prev.map((u) =>
            u._id === targetUserId ? { ...u, isFollowing: !u.isFollowing } : u
          )
        );
        setFilteredUsers((prev) =>
          prev.map((u) =>
            u._id === targetUserId ? { ...u, isFollowing: !u.isFollowing } : u
          )
        );
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Search Users</h2>

      {loading && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          Loading users...
        </p>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={u.profileImage || "https://i.pravatar.cc/150"}
                  alt={u.username}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold">{u.username}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {u.bio || "No bio available"}
                  </p>
                </div>
              </div>

              {/* ✅ Follow Button */}
              {user?._id !== u._id && (
                <button
                  onClick={() => handleFollow(u._id)}
                  className={`mt-4 w-full py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
                    u.isFollowing
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <FiUserPlus />
                  {u.isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
          No users found.
        </p>
      )}
    </div>
  );
};

export default SearchUser;
