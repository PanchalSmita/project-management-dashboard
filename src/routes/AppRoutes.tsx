import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import BoardView from "../pages/BoardView";
import UserSettings from "../pages/UserSettings";
import GitHubCallback from "../pages/GitHubCallback";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/github/callback" element={<GitHubCallback />} />

      {/* Protected Routes - Accessible by all authenticated users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/board"
        element={
          <ProtectedRoute>
            <BoardView />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes - Only ADMIN role can access */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <UserSettings />
          </ProtectedRoute>
        }
      />

      {/* Example: Manager and Admin can access this route */}
      {/* <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <Reports />
          </ProtectedRoute>
        }
      /> */}

      {/* Catch all - redirect to dashboard if authenticated, login otherwise */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;