import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginSuccess, setLoading } from "../redux/slices/authSlice";
import { registerAPI } from "../api/authAPI";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError("");
    dispatch(setLoading(true));

    try {
      const res = await registerAPI({ email, password });
      dispatch(loginSuccess({
        user: { email },
        role: res.data.role
      }));
      navigate("/home");
    } catch (err) {
      setLocalError(err.response?.data?.error || "Registration failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">
          FeedUp Platform
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Create your account
        </p>

        {/* Error message */}
        {localError && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {localError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}