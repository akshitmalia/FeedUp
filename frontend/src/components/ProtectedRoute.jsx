import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, role } = useSelector((state) => state.auth);

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // Admin only route but user is not admin → redirect to home
  if (adminOnly && role !== "admin") {
    return <Navigate to="/home" />;
  }

  // All checks passed → show the page
  return children;
}