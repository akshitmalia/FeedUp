import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutSuccess } from "../redux/slices/authSlice";
import { logoutAPI } from "../api/authAPI";

export default function Navbar() {
  const { isLoggedIn, role, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to={isLoggedIn ? "/home" : "/"} className="no-underline">
          <h1 className="text-xl font-bold text-blue-500 italic">FeedUp</h1>
        </Link>

        {/* Desktop Nav — hidden on mobile */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-5">
            <Link to="/home" className="text-gray-300 hover:text-white transition font-medium text-sm">
              Home
            </Link>
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition font-medium text-sm">
              Dashboard
            </Link>
            {role === "admin" && (
              <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 transition font-medium text-sm">
                Admin
              </Link>
            )}
            {/* Email truncated so it never overflows */}
            <span className="text-gray-400 text-xs max-w-[140px] truncate">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition text-sm"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Mobile hamburger — shown only on small screens */}
        {isLoggedIn && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white text-2xl focus:outline-none"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isLoggedIn && menuOpen && (
        <div className="md:hidden bg-gray-700 px-4 py-4 flex flex-col gap-4 border-t border-gray-600">
          {/* Truncated email at top */}
          <span className="text-gray-400 text-xs truncate">
            {user?.email}
          </span>
          <Link
            to="/home"
            onClick={() => setMenuOpen(false)}
            className="text-gray-300 hover:text-white font-medium text-sm"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="text-gray-300 hover:text-white font-medium text-sm"
          >
            Dashboard
          </Link>
          {role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="text-yellow-400 hover:text-yellow-300 font-medium text-sm"
            >
              Admin Panel
            </Link>
          )}
          <button
            onClick={() => { setMenuOpen(false); handleLogout(); }}
            className="w-full py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition text-sm"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}