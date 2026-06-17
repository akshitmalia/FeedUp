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
    <nav className="bg-ink/95 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
      <div className="px-4 py-3.5 flex items-center justify-between">

        <Link to={isLoggedIn ? "/home" : "/"} className="no-underline flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-ember"></span>
          <h1 className="font-display text-lg font-bold text-paper tracking-tight">
            Feed<span className="text-ember">Up</span>
          </h1>
        </Link>

        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-6">
            <Link to="/home" className="text-slate hover:text-paper transition font-medium text-sm">
              Feed
            </Link>
            <Link to="/dashboard" className="text-slate hover:text-paper transition font-medium text-sm">
              Activity
            </Link>
            {role === "admin" && (
              <Link to="/admin" className="text-violet hover:text-violet/70 transition font-medium text-sm">
                Admin
              </Link>
            )}
            <span className="font-mono text-[11px] text-slate/70 max-w-[140px] truncate">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 bg-white/5 text-paper rounded-lg font-medium hover:bg-white/10 transition text-sm border border-white/10"
            >
              Sign out
            </button>
          </div>
        )}

        {isLoggedIn && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-paper text-2xl focus:outline-none leading-none"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </div>

      {isLoggedIn && menuOpen && (
        <div className="md:hidden bg-surface px-4 py-4 flex flex-col gap-4 border-t border-white/5">
          <span className="font-mono text-[11px] text-slate truncate">
            {user?.email}
          </span>
          <Link to="/home" onClick={() => setMenuOpen(false)} className="text-paper font-medium text-sm">
            Feed
          </Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-paper font-medium text-sm">
            Activity
          </Link>
          {role === "admin" && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-violet font-medium text-sm">
              Admin Panel
            </Link>
          )}
          <button
            onClick={() => { setMenuOpen(false); handleLogout(); }}
            className="w-full py-2 bg-white/5 text-paper rounded-lg font-medium text-sm border border-white/10"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}