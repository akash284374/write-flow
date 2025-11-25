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
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [profilePreview, coverPreview]);

  // Update bio when user changes
  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
    }
  }, [user]);

  // Fetch profile data
  useEffect(() => {
    if (!user?.id && !user?._id) return;
    const userId = user?.id || user?._id;

    const fetchProfileData = async () => {
      try {
        const [followersRes, followingRes, postsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/users/${userId}/followers`, { credentials: "include" }),
          fetch(`http://localhost:5000/api/users/${userId}/following`, { credentials: "include" }),
          fetch(`http://localhost:5000/api/flows/user`, { credentials: "include" }),
        ]);

        const [followersData, followingData, postsData] = await Promise.all([
          followersRes.json(),
          followingRes.json(),
          postsRes.json(),
        ]);

        setFollowers(followersData.data || []);
        setFollowing(followingData.data || []);
        setFriends(
          (followersData.data || []).filter(f =>
            (followingData.data || []).some(fn => fn._id === f._id)
          )
        );
        setPosts(postsData.posts || postsData.data || []);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (type === "profile") {
      setProfileFile(file);
      setProfilePreview(preview);
    } else if (type === "cover") {
      setCoverFile(file);
      setCoverPreview(preview);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update profile image
      if (profileFile) {
        const formData = new FormData();
        formData.append("profileImage", profileFile);
        
        const res = await fetch("http://localhost:5000/api/auth/update-profile-image", { 
          method: "PUT", 
          body: formData, 
          credentials: "include" 
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          console.error("Profile image update failed:", data);
          alert("Failed to update profile image: " + (data.error || data.message || "Unknown error"));
          setIsSaving(false);
          return;
        }
        
        console.log("Profile image updated successfully");
      }

      // Update cover image
      if (coverFile) {
        const formData = new FormData();
        formData.append("coverImage", coverFile);
        
        const res = await fetch("http://localhost:5000/api/auth/update-cover-image", { 
          method: "PUT", 
          body: formData, 
          credentials: "include" 
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          console.error("Cover image update failed:", data);
          alert("Failed to update cover image: " + (data.error || data.message || "Unknown error"));
          setIsSaving(false);
          return;
        }
        
        console.log("Cover image updated successfully");
      }

      // Update bio
      if (bio !== user?.bio) {
        const res = await fetch("http://localhost:5000/api/auth/update-bio", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bio }),
          credentials: "include",
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          console.error("Bio update failed:", data);
          alert("Failed to update bio: " + (data.error || data.message || "Unknown error"));
          setIsSaving(false);
          return;
        }
        
        console.log("Bio updated successfully");
      }

      // ✅ CRITICAL: Refresh user data from backend
      console.log("Refreshing user data...");
      await refreshUser();
      
      // Clear previews and files
      setProfileFile(null);
      setCoverFile(null);
      setProfilePreview(null);
      setCoverPreview(null);
      
      setIsEditing(false);
      alert("Profile updated successfully!");
      
    } catch (err) {
      console.error("handleSave error:", err);
      alert("Failed to update profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;
  if (!user) return <div className="flex justify-center items-center min-h-screen">User not found</div>;

  // Generate unique URLs to prevent caching
  const getImageUrl = (url, defaultImg) => {
    if (!url) return defaultImg;
    return `${url}?t=${new Date().getTime()}`;
  };

  const profileImageUrl = getImageUrl(user.profileImage, defaultProfile);
  const coverImageUrl = getImageUrl(user.coverImage, defaultCover);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-black dark:text-white">
      {/* Cover & Profile */}
      <div className="relative h-60 bg-gray-300 dark:bg-gray-800">
        <img 
          key={coverImageUrl} // Force re-render when URL changes
          src={coverPreview || coverImageUrl} 
          alt="cover" 
          className="w-full h-full object-cover rounded-b-2xl" 
          onError={e => (e.target.src = defaultCover)} 
        />
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <div className="w-32 h-32 border-4 border-white dark:border-[#0f0f0f] rounded-full overflow-hidden shadow-lg">
            <img 
              key={profileImageUrl} // Force re-render when URL changes
              src={profilePreview || profileImageUrl} 
              alt="profile" 
              className="w-full h-full object-cover" 
              onError={e => (e.target.src = defaultProfile)} 
            />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 text-center px-6">
        <h1 className="text-3xl font-bold">{user.username}</h1>
        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
        <p className="mt-3 text-lg">{user.bio || "No bio available"}</p>
        <button 
          onClick={() => setIsEditing(true)} 
          className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Edit Profile
        </button>

        {/* Stats */}
        <div className="mt-6 flex justify-center gap-8 text-sm font-medium">
          <div><p className="text-xl font-bold">{followers.length}</p><p className="text-gray-500 dark:text-gray-400">Followers</p></div>
          <div><p className="text-xl font-bold">{following.length}</p><p className="text-gray-500 dark:text-gray-400">Following</p></div>
          <div><p className="text-xl font-bold">{friends.length}</p><p className="text-gray-500 dark:text-gray-400">Friends</p></div>
        </div>
      </div>

      {/* Posts */}
      <div className="my-8 border-t border-gray-300 dark:border-gray-700" />
      <div className="px-6 md:px-20">
        <h2 className="text-2xl font-semibold mb-6">My Posts</h2>
        {posts.length ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-sm hover:shadow-md transition">
                {post.title && <h3 className="font-semibold mb-2">{post.title}</h3>}
                <p>{post.content}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-600 dark:text-gray-400">No posts yet.</p>}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <label className="block mb-3">
              <span className="text-sm font-medium">Profile Picture</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, "profile")} 
                className="mt-1 block w-full text-sm text-gray-500" 
                disabled={isSaving}
              />
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium">Cover Picture</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, "cover")} 
                className="mt-1 block w-full text-sm text-gray-500" 
                disabled={isSaving}
              />
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium">Bio</span>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={3} 
                className="mt-1 block w-full p-2 border rounded-md text-sm dark:bg-gray-800 dark:text-white" 
                placeholder="Write something about yourself..." 
                disabled={isSaving}
              />
            </label>
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setProfileFile(null);
                  setCoverFile(null);
                  setProfilePreview(null);
                  setCoverPreview(null);
                  setBio(user?.bio || "");
                }}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-400"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
