import React, { useState, useContext } from "react";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", { email, password });

      const userData = {
        id: res.data.id,
        email: res.data.email,
        roles: res.data.roles,
      };

      login(res.data.token, userData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="backdrop-blur-lg bg-white/10 border border-white/30 shadow-lg p-8 rounded-2xl w-full max-w-md transform transition duration-300 hover:scale-[1.02]">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 bg-white/20 placeholder-white/80 text-white border border-white/30 rounded-lg focus:outline-none focus:border-blue-400 transition"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-white/20 placeholder-white/80 text-white border border-white/30 rounded-lg focus:outline-none focus:border-blue-400 transition"
          />

          <button className="w-full p-3 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg font-semibold transition shadow-md hover:shadow-blue-500/50">
            Login
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-gray-300 mt-4">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-400 hover:text-green-500 font-semibold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}