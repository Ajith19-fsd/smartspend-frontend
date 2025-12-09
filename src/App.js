import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext, useState } from "react";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp"; // 👈 MUST IMPORT
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import ProtectedRoute from "./components/ProtectedRoute";
import Notification from "./components/Notification";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { user } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => setShowNotifications((prev) => !prev);

  return (
    <BrowserRouter>
      {/* Show Navbar only if logged in */}
      {user && <Navbar onToggleNotifications={toggleNotifications} />}

      {/* Show notifications popup only if logged in */}
      {user && (
        <Notification
          show={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      <div className={`${!user ? "" : "container mx-auto p-4"}`}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/verify-otp"
            element={!user ? <VerifyOtp /> : <Navigate to="/dashboard" />} // 👈 ADDED
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <Budget />
              </ProtectedRoute>
            }
          />

          {/* Catch all unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
