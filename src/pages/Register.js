import React, { useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      alert("⚠ Please fill in Name, Email & Password!");
      return;
    }

    setLoading(true);
    try {
      // your backend expects fields matching User model. If your User field name is 'fullName',
      // ensure backend User has that property. Otherwise send 'name' or 'username' accordingly.
      const payload = { fullName, email, password };

      const res = await api.post("/api/auth/signup", payload);

      if (res?.data) {
        const { message, verified } = res.data;
        alert(message || "Registration successful!");

        if (verified === true) {
          // Local dev: user already verified -> skip OTP page and go to login
          navigate("/login");
        } else {
          // Production: OTP sent -> navigate to Verify OTP page
          navigate("/verify-otp", { state: { email } });
        }
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert(err?.response?.data?.error || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="backdrop-blur-lg bg-white/10 border border-white/30 shadow-lg p-8 rounded-2xl w-full max-w-md transform transition duration-300 hover:scale-[1.02]">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create Account ✨
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            name="fullName"
            placeholder="Full Name"
            className="w-full p-3 bg-white/20 placeholder-white/80 text-white border border-white/30 rounded-lg focus:outline-none focus:border-green-400 transition"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            placeholder="Email"
            className="w-full p-3 bg-white/20 placeholder-white/80 text-white border border-white/30 rounded-lg focus:outline-none focus:border-green-400 transition"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-white/20 placeholder-white/80 text-white border border-white/30 rounded-lg focus:outline-none focus:border-green-400 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 ${
              loading ? "bg-green-400/80" : "bg-green-500/80 hover:bg-green-600"
            } text-white rounded-lg font-semibold transition shadow-md hover:shadow-green-500/50`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
