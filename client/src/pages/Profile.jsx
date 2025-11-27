// 🚀 FIXED & UPDATED PROFILE PAGE (Includes Followers, Following + Modals)

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import defaultProfile from "../assets/defaultProfile.png";
import defaultCover from "../assets/defaultCover.png";

const Profile = () => {
  const { user, loading, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [bio, setBio] = useState("");

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Modals for followers/following
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  // Cleanup previews
  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [profilePreview, coverPreview]);

  // Update bio when user changes
  useEffect(() => {
    if (user) setBio(user.bio || "");
  }, [user]);

  // -------------------- FETCH FOLLOWERS, FOLLOWING, POSTS --------------------
  useEffect(() => {
    if (!user?._id && !user?.id) return;

    const userId = user._id || user.id;

    const fetchData = async () => {
      try {
        const [followersRes, followingRes, postsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/follow/followers/${userId}`, {
            credentials: "include",
          }),
          fetch(`http://localhost:5000/api/follow/following/${userId}`, {
            credentials: "include",
          }),
          fetch(`http://localhost:5000/api/flows/user`, {
            credentials: "include",
          }),
        ]);

        const followersData = await followersRes.json();
        const followingData = await followingRes.json();
        const postsData = await postsRes.json();

        setFollowers(followersData.data || []);
        setFollowing(followingData.data || []);
        setPosts(postsData.posts || postsData.data || []);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchData();
  }, [user]);

  // -------------------- FILE UPLOAD HANDLERS --------------------
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    if (type === "profile") {
      setProfileFile(file);
      setProfilePreview(preview);
    } else {
      setCoverFile(file);
      setCoverPreview(preview);
    }
  };

  // -------------------- SAVE PROFILE CHANGES --------------------
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Upload profile image
      if (profileFile) {
        const formData = new FormData();
        formData.append("profileImage", profileFile);

        await fetch("http://localhost:5000/api/auth/update-profile-image", {
          method: "PUT",
          body: formData,
          credentials: "include",
        });
      }

      // Upload cover image
      if (coverFile) {
        const formData = new FormData();
        formData.append("coverImage", coverFile);

        await fetch("http://localhost:5000/api/auth/update-cover-image", {
          method: "PUT",
          body: formData,
          credentials: "include",
        });
      }

      // Update bio
      if (bio !== user.bio) {
        await fetch("http://localhost:5000/api/auth/update-bio", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bio }),
          credentials: "include",
        });
      }

      await refreshUser();

      setIsEditing(false);
      setProfileFile(null);
      setCoverFile(null);
      setProfilePreview(null);
      setCoverPreview(null);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to update profile.");
    }

    setIsSaving(false);
  };

  if (loading)
    return <div className="flex justify-center items-center min-h-screen">Loading…</div>;

  if (!user)
    return <div className="flex justify-center items-center min-h-screen">User not found</div>;

  // Prevent browser cache on images
  const bustCache = (url, fallback) =>
    url ? `${url}?t=${Date.now()}` : fallback;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-black dark:text-white">
      {/* Cover */}
      <div className="relative h-60 bg-gray-300 dark:bg-gray-800">
        <img
          src={coverPreview || bustCache(user.coverImage, defaultCover)}
          className="w-full h-full object-cover rounded-b-2xl"
          alt="cover"
        />

        {/* Profile Pic */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#0f0f0f] shadow-lg">
            <img
              src={profilePreview || bustCache(user.profileImage, defaultProfile)}
              className="w-full h-full object-cover"
              alt="profile"
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-20 text-center px-6">
        <h1 className="text-3xl font-bold">{user.username}</h1>
        <p className="text-gray-500">{user.email}</p>
        <p className="mt-3 text-lg">{user.bio || "No bio yet"}</p>

        <button
          onClick={() => setIsEditing(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Edit Profile
        </button>

        {/* Stats */}
        <div className="mt-6 flex justify-center gap-10 text-center">
          {/* Followers */}
          <div onClick={() => setShowFollowersModal(true)} className="cursor-pointer">
            <p className="text-xl font-bold">{followers.length}</p>
            <p className="text-sm text-gray-400">Followers</p>
          </div>

          {/* Following */}
          <div onClick={() => setShowFollowingModal(true)} className="cursor-pointer">
            <p className="text-xl font-bold">{following.length}</p>
            <p className="text-sm text-gray-400">Following</p>
          </div>
        </div>
      </div>

      {/* POSTS */}
      <div className="px-6 mt-10">
        <h2 className="text-2xl font-semibold mb-4">My Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-400">No posts yet</p>
        ) : (
          <div className="space-y-6">
            {posts.map((p) => (
              <div key={p._id} className="p-4 bg-gray-100 dark:bg-gray-900 rounded-xl border">
                <h3 className="font-semibold">{p.title}</h3>
                <p>{p.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>

            <label className="block mb-4">
              <span>Profile Picture</span>
              <input type="file" onChange={(e) => handleFileChange(e, "profile")} />
            </label>

            <label className="block mb-4">
              <span>Cover Picture</span>
              <input type="file" onChange={(e) => handleFileChange(e, "cover")} />
            </label>

            <label className="block mb-4">
              <span>Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </label>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOLLOWERS MODAL */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[90%] max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Followers</h2>

            {followers.length === 0 ? (
              <p className="text-gray-400">No followers yet</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {followers.map((u) => (
                  <div key={u._id} className="flex items-center gap-3">
                    <img
                      src={u.profileImage || defaultProfile}
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                    <p>{u.username}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowFollowersModal(false)}
              className="mt-4 px-4 py-2 bg-gray-300 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FOLLOWING MODAL */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[90%] max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Following</h2>

            {following.length === 0 ? (
              <p className="text-gray-400">Not following anyone yet</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {following.map((u) => (
                  <div key={u._id} className="flex items-center gap-3">
                    <img
                      src={u.profileImage || defaultProfile}
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                    <p>{u.username}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowFollowingModal(false)}
              className="mt-4 px-4 py-2 bg-gray-300 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
