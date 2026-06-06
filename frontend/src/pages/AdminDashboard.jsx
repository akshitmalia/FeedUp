import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  getStatsAPI, getAllUsersAPI, getAllPostsAdminAPI,
  deleteAnyPostAPI, toggleBlockUserAPI,
} from "../api/adminAPI";
import Navbar from "../components/Navbar";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, postsRes] = await Promise.all([
        getStatsAPI(), getAllUsersAPI(), getAllPostsAdminAPI(),
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

  const topPostsChartData = stats?.topPosts?.map((post, index) => ({
    name: `#${index + 1}`,
    votes: post.votes,
    fullText: post.post,
  })) || [];

  const userVsPostsData = [
    { name: "Users", value: stats?.totalUsers || 0 },
    { name: "Posts", value: stats?.totalPosts || 0 },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center mt-20">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-500 mb-1">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 text-sm mb-6">Manage all posts and users</p>

        {/* Stats Cards — 1 col mobile, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Users", value: stats?.totalUsers || 0, color: "text-blue-600" },
            { label: "Total Posts", value: stats?.totalPosts || 0, color: "text-green-600" },
            { label: "Top Voted", value: stats?.topPosts?.length || 0, color: "text-purple-600" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow p-5 text-center">
              <h3 className="text-gray-500 text-xs font-medium mb-2">{card.label}</h3>
              <p className={`text-4xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs — full width equal on mobile */}
        <div className="flex gap-2 mb-6">
          {["overview", "posts", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition ${
                activeTab === tab
                  ? "bg-yellow-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "overview" ? "Overview" : tab === "posts" ? "Posts" : "Users"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
              <h2 className="text-base md:text-xl font-bold text-gray-700 mb-4">
                Top Voted Posts
              </h2>
              {topPostsChartData.length === 0 ? (
                <p className="text-center text-gray-400">No upvoted posts yet!</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topPostsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, _, props) => [
                        `${value} votes`,
                        props.payload.fullText?.substring(0, 30) + "..."
                      ]}
                    />
                    <Bar dataKey="votes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
              <h2 className="text-base md:text-xl font-bold text-gray-700 mb-4">
                Platform Overview
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={userVsPostsData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                    {userVsPostsData.map((_, index) => (
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
          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            <h2 className="text-base font-bold text-gray-700 mb-4">All Posts</h2>
            {allPosts.length === 0 ? (
              <p className="text-center text-gray-400">No posts yet!</p>
            ) : (
              allPosts.map((post) => (
                <div key={post._id}
                  className="border border-gray-200 rounded-xl p-3 mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Post content */}
                  <div className="flex-1 min-w-0">
                    {/* break-words stops long text overflowing on mobile */}
                    <p className="text-gray-800 text-sm break-words">{post.post}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <small className="text-gray-400 text-xs">
                        {new Date(post.createdAt).toLocaleString()}
                      </small>
                      {/* Email truncated so it never overflows */}
                      <small className="text-blue-400 text-xs truncate max-w-[160px]">
                        {post.userId?.email || "Unknown"}
                      </small>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-xs font-medium">
                      ▲ {post.votes}
                    </span>
                    <button onClick={() => handleDeletePost(post._id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-xs font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            <h2 className="text-base font-bold text-gray-700 mb-4">All Users</h2>
            {allUsers.length === 0 ? (
              <p className="text-center text-gray-400">No users yet!</p>
            ) : (
              allUsers.map((user) => (
                <div key={user._id}
                  className="border border-gray-200 rounded-xl p-3 mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    {/* Email truncated on small screens */}
                    <p className="text-gray-800 font-medium text-sm truncate max-w-[200px] sm:max-w-none">
                      {user.email}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {user.posts?.length || 0} posts
                    </span>
                    {user.role !== "admin" && (
                      <button onClick={() => handleToggleBlock(user._id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                          user.isBlocked
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}>
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