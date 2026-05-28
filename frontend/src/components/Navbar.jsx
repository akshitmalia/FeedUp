import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutSuccess } from "../redux/slices/authSlice";
import { logoutAPI } from "../api/authAPI";

export default function Navbar() {
  const { isLoggedIn, role, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(logoutSuccess());
      navigate("/login");
    }
  };

  return (
    <nav className="bg-gray-800 px-8 py-4 flex items-center justify-between shadow-md">
      {/* Logo */}
      <Link to={isLoggedIn ? "/home" : "/"}>
        <h1 className="text-2xl font-bold text-blue-500 italic">FeedUp</h1>
      </Link>

      {/* Nav Links */}
      {isLoggedIn && (
        <div className="flex items-center gap-6">
          <Link
            to="/home"
            className="text-gray-300 hover:text-white transition font-medium"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="text-gray-300 hover:text-white transition font-medium"
          >
            Dashboard
          </Link>
          {role === "admin" && (
            <Link
              to="/admin"
              className="text-yellow-400 hover:text-yellow-300 transition font-medium"
            >
              Admin
            </Link>
          )}
          <span className="text-gray-400 text-sm">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}