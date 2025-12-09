import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 Detect Dev Mode (No REACT_APP_API_URL → Localhost)
  const isDev = !process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }

    // 🛑 If in Localhost (Dev Mode): Skip OTP page automatically
    if (isDev) {
      alert("✨ Development Mode: Email auto-verified. Redirecting to Login...");
      navigate("/login");
    }
  }, [location.state, isDev, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      alert("⚠ Please enter Email & OTP!");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/verify-otp", { email, otp });
      alert("🎉 Email verified successfully! You can now login.");
      navigate("/login");
    } catch (err) {
      alert(err?.response?.data?.error || "❌ Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🛑 Do not render UI in dev mode (we already redirected)
  if (isDev) return null;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="backdrop-blur-lg bg-white/10 border border-white/30 shadow-lg p-8 rounded-2xl w-full max-w-md transform transition duration-300 hover:scale-[1.02]">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Verify Email 🔐
        </h2>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Registered Email"
            disabled={!!location.state?.email}
            className="w-full p-3 bg-white/20 placeholder-white/80 text-white border border-white/30 rounded-lg focus:outline-none focus:border-blue-400 transition"
          />

          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full p-3 bg-white/20 placeholder-white/80 text-white border border-white/30 rounded-lg focus:outline-none focus:border-blue-400 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 ${
              loading ? "bg-blue-400/80" : "bg-blue-500/80 hover:bg-blue-600"
            } text-white rounded-lg font-semibold transition shadow-md hover:shadow-blue-500/50`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="text-center text-gray-300 mt-4">
          Didn’t register?{" "}
          <Link to="/register" className="text-green-400 hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
