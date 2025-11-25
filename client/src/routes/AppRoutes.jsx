// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

// Pages
import Home from "../pages/Home";
import CreateFlow from "../pages/CreateFlow";
import SearchUser from "../pages/SearchUser";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Friends from "../pages/Friends";
import Settings from "../pages/Settings";
import Logout from "../pages/Logout";
import Feed from "../pages/Feed";
import AllFlows from "../pages/AllFlows";
import Register from "../pages/Register";
import Login from "../pages/Login";
import VerifyOtp from "../pages/VerifyOtpPage";

const AppRoutes = ({ searchQuery, setSearchQuery }) => {
  return (
    <Routes>
      {/* Main layout for logged-in routes */}
      <Route
        element={
          <Layout
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        }
      >
        <Route path="/" element={<Home searchQuery={searchQuery} />} />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateFlow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchUser searchQuery={searchQuery} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed searchQuery={searchQuery} />
            </ProtectedRoute>
          }
        />
        {/* Add /flows route for FEED here */}
        <Route
          path="/flows"
          element={
            <ProtectedRoute>
              <Feed searchQuery={searchQuery} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-flows"
          element={
            <ProtectedRoute>
              <AllFlows />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth Routes (public) */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
};

export default AppRoutes;
