// src/pages/Logout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Logout = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        setUser(null); // clear user context
        navigate("/login"); // redirect to login
      } catch (err) {
        console.error("Logout failed:", err);
      }
    };

    logoutUser();
  }, [setUser, navigate]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold">Logging out...</h1>
      <p className="mt-2 text-gray-500">You will be redirected shortly.</p>
    </div>
  );
};

export default Logout;
