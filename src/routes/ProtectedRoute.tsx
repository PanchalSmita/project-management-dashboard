import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[]; // Optional: specify which roles can access this route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user's role is allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to unauthorized page or dashboard
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f1f1f]">
        <div className="text-center p-8 bg-[#2a2a2a] rounded-lg shadow-xl max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-white/70 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-white/50 mb-6">
            Your role: <span className="text-cyan-400 font-semibold">{user.role}</span>
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has the right role
  return <>{children}</>;
};

export default ProtectedRoute;