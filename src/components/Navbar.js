import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({ onToggleNotifications }) {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/");
  };

  return (
    <nav className="backdrop-blur-md bg-white/10 border-b border-white/20 shadow-sm p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center text-white">
        <div className="font-bold text-xl tracking-wide">💎 SmartSpend</div>

        <div className="space-x-4">
          {user ? (
            <>
              <Link className="hover:text-blue-300 transition" to="/dashboard">Dashboard</Link>

              <button
                onClick={onToggleNotifications}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 border border-white/40 rounded-md transition"
              >
                🔔
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500/70 hover:bg-red-600 transition rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="hover:text-blue-300 transition" to="/">Login</Link>
              <Link className="px-3 py-1 bg-green-500/70 hover:bg-green-600 rounded transition" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
