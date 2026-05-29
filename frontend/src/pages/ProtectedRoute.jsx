import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
 
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, role, loading } = useSelector((state) => state.auth);
 
  // Wait for /me check to finish before deciding to redirect
  // This prevents the blank flash on page refresh
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f4f8"
      }}>
        <p style={{ color: "#888", fontSize: "16px" }}>Loading...</p>
      </div>
    );
  }
 
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
 
  if (adminOnly && role !== "admin") {
    return <Navigate to="/home" />;
  }
 
  return children;
}import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
 
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, role, loading } = useSelector((state) => state.auth);
 
  // Wait for /me check to finish before deciding to redirect
  // This prevents the blank flash on page refresh
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f4f8"
      }}>
        <p style={{ color: "#888", fontSize: "16px" }}>Loading...</p>
      </div>
    );
  }
 
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
 
  if (adminOnly && role !== "admin") {
    return <Navigate to="/home" />;
  }
 
  return children;
}