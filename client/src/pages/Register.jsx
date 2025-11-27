"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { signup } = useAuth(); // ✅ Use AuthContext signup()
  const [error, setError] = useState("");
  const [loadingButton, setLoadingButton] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setError("");
    setLoadingButton(true);

    try {
      const result = await signup(data); // 🔥 THIS logs in & stores user in context

      if (result.success) {
        reset();

        // 🔥 Redirect to HOME after signup
        navigate("/");

        return;
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Please try again.");
    } finally {
      setLoadingButton(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Register</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Register yourself to get started!
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              disabled={loadingButton}
              {...register("name", { required: true })}
              className="w-full border rounded p-2 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              disabled={loadingButton}
              {...register("username", { required: true })}
              className="w-full border rounded p-2 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              disabled={loadingButton}
              {...register("email", { required: true })}
              className="w-full border rounded p-2 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              disabled={loadingButton}
              {...register("password", { required: true })}
              className="w-full border rounded p-2 text-black"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loadingButton}
            className="w-full bg-black text-white py-2 rounded font-semibold disabled:bg-gray-300"
          >
            {loadingButton ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already registered?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
