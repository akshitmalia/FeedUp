import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getStatsAPI,
  getAllUsersAPI,
  getAllPostsAdminAPI,
  deleteAnyPostAPI,
  toggleBlockUserAPI,
} from "../api/adminAPI";
import Navbar from "../components/Navbar";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, postsRes] = await Promise.all([
        getStatsAPI(),
        getAllUsersAPI(),
        getAllPostsAdminAPI(),
      ]);
      setStats(statsRes.data);
      setAllUsers(usersRes.data);
      setAllPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deleteAnyPostAPI(id);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      await toggleBlockUserAPI(id);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to block/unblock");
    }
  };

  // Chart data
  const topPostsChartData = stats?.topPosts?.map((post, index) => ({
    name: `Post ${index + 1}`,
    votes: post.votes,
    fullText: post.post,
  })) || [];

  const userVsPostsData = [
    { name: "Total Users", value: stats?.totalUsers || 0 },
    { name: "Total Posts", value: stats?.totalPosts || 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center mt-20">
          <p className="text-gray-500 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <h1 className="text-3xl font-bold text-yellow-500 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mb-8">Manage all posts and users</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Total Users
            </h3>
            <p className="text-4xl font-bold text-blue-600">
              {stats?.totalUsers || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Total Posts
            </h3>
            <p className="text-4xl font-bold text-green-600">
              {stats?.totalPosts || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Top Voted Posts
            </h3>
            <p className="text-4xl font-bold text-purple-600">
              {stats?.topPosts?.length || 0}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["overview", "posts", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                activeTab === tab
                  ? "bg-yellow-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "overview" ? "Overview" : tab === "posts" ? "All Posts" : "All Users"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Bar Chart - Top Posts */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-700 mb-6">
                Top Voted Posts
              </h2>
              {topPostsChartData.length === 0 ? (
                <p className="text-center text-gray-400">No upvoted posts yet!</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPostsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} votes`,
                        props.payload.fullText.substring(0, 40) + "..."
                      ]}
                    />
                    <Bar dataKey="votes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie Chart - Users vs Posts */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-700 mb-6">
                Platform Overview
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userVsPostsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {userVsPostsData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* All Posts Tab */}
        {activeTab === "posts" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              All Posts
            </h2>
            {allPosts.length === 0 ? (
              <p className="text-center text-gray-400">No posts yet!</p>
            ) : (
              allPosts.map((post) => (
                <div
                  key={post._id}
                  className="border border-gray-200 rounded-xl p-4 mb-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-gray-800">{post.post}</p>
                    <div className="flex gap-3 mt-1">
                      <small className="text-gray-400 text-xs">
                        {new Date(post.createdAt).toLocaleString()}
                      </small>
                      <small className="text-blue-400 text-xs">
                        {post.userId?.email || "Unknown"}
                      </small>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm font-medium">
                      ▲ {post.votes}
                    </span>
<button
  onClick={() => handleDeletePost(post._id)}
  className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
>
  <span className="text-red-600">🗑</span> Delete
</button>

                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              All Users
            </h2>
            {allUsers.length === 0 ? (
              <p className="text-center text-gray-400">No users yet!</p>
            ) : (
              allUsers.map((user) => (
                <div
                  key={user._id}
                  className="border border-gray-200 rounded-xl p-4 mb-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-gray-800 font-medium">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === "admin"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-blue-100 text-blue-600"
                      }`}>
                        {user.role}
                      </span>
                      {user.isBlocked && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {user.posts?.length || 0} posts
                    </span>
                    {user.role !== "admin" && (
                      <button
                        onClick={() => handleToggleBlock(user._id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          user.isBlocked
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}