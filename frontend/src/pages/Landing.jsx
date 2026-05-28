import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function Landing() {
  const { isLoggedIn, role } = useSelector((state) => state.auth);

  // If already logged in redirect directly
  if (isLoggedIn) {
    return role === "admin" ? <Navigate to="/admin" /> : <Navigate to="/home" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-blue-500 italic">FeedUp</h1>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-red-500 rounded-lg font-medium hover:bg-red-600 transition"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-4 mt-20">
        <h1 className="text-5xl font-bold text-blue-500 mb-6">
          FeedUp Platform
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mb-4">
          FeedUp is a community-driven platform where anyone can share their
          thoughts and ideas anonymously. Every post can be upvoted once,
          helping the most valuable contributions rise to the top.
        </p>
        <p className="text-gray-400 text-lg max-w-2xl mb-8">
          Whether you want to express yourself, discover trending opinions, or
          explore what others are saying, FeedUp gives you a simple and secure
          space to connect without revealing your identity.
        </p>

        <div className="flex gap-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-red-500 rounded-lg font-semibold text-lg hover:bg-red-600 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-20 px-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-gray-800 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-blue-400 mb-2">Anonymous Posting</h3>
          <p className="text-gray-400">Share your thoughts without revealing your identity</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-green-400 mb-2">Upvote System</h3>
          <p className="text-gray-400">One upvote per post — best content rises to top</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-red-400 mb-2">Top Feed</h3>
          <p className="text-gray-400">Discover the most popular posts from the community</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-500 pb-8">
        <p>Made by <span className="text-blue-400 font-medium">Akshit Malia</span></p>
        <p className="text-sm mt-1">akshitmalia2005@gmail.com</p>
      </footer>

    </div>
  );
}