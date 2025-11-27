"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Use AuthContext login()
  const [error, setError] = useState("");
  const [loadingButton, setLoadingButton] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setError("");
    setLoadingButton(true);

    try {
      const result = await login(data); // ✅ AuthContext login()

      if (result.success) {
        reset();
        navigate("/"); // ✅ Redirect HOME
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Login failed. Try again.");
    } finally {
      setLoadingButton(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Login</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Welcome Back! Log in to continue.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              disabled={loadingButton}
              {...register("email", { required: true })}
              className="w-full border rounded p-2 text-black placeholder-gray-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              disabled={loadingButton}
              {...register("password", { required: true })}
              className="w-full border rounded p-2 text-black placeholder-gray-500"
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loadingButton}
            className="w-full bg-black text-white py-2 rounded font-semibold disabled:bg-gray-300"
          >
            {loadingButton ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
