import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load email from sessionStorage on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("otpEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate("/register"); // redirect if no email found
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return alert("Please enter the OTP.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "OTP verified successfully!");
        sessionStorage.removeItem("otpEmail");
        navigate("/login");
      } else {
        alert(data.message || "Invalid OTP, try again.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      alert("Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
          Verify OTP
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          An OTP has been sent to <strong>{email}</strong>
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-2 mb-6 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded transition text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtpPage;
