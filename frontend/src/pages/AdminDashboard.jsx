import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  getStatsAPI, getAllUsersAPI, getAllPostsAdminAPI,
  deleteAnyPostAPI,
} from "../api/adminAPI";
import Navbar from "../components/Navbar";

const COLORS = ["#FF6B4A", "#6C63FF"];

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

  const topPostsChartData = stats?.topPosts?.map((post, index) => ({
    name: `#${index + 1}`,
    votes: post.votes,
    fullText: post.post,
  })) || [];

  const userVsPostsData = [
    { name: "Users", value: stats?.totalUsers || 0 },
    { name: "Posts", value: stats?.totalPosts || 0 },
  ];

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "posts", label: "Posts" },
    { key: "users", label: "Users" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="text-center text-slate py-20 font-mono text-sm">Loading admin panel...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="mb-8">
          <p className="font-mono text-[11px] text-violet uppercase tracking-widest mb-1">
            Platform control
          </p>
          <h1 className="font-display text-2xl font-bold text-paper">
            Admin overview
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <p className="text-slate text-[11px] font-medium uppercase tracking-wide mb-2">Users</p>
            <p className="font-mono text-3xl font-bold text-paper">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <p className="text-slate text-[11px] font-medium uppercase tracking-wide mb-2">Posts</p>
            <p className="font-mono text-3xl font-bold text-ember">{stats?.totalPosts || 0}</p>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <p className="text-slate text-[11px] font-medium uppercase tracking-wide mb-2">Top voted</p>
            <p className="font-mono text-3xl font-bold text-violet">{stats?.topPosts?.length || 0}</p>
          </div>
        </div>

        <div className="flex gap-6 mb-6 border-b border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium font-display transition relative ${
                activeTab === tab.key ? "text-paper" : "text-slate hover:text-paper/70"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-ember rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-surface rounded-2xl p-5 border border-white/5">
              <p className="font-display text-sm font-semibold text-paper mb-4">Top voted posts</p>
              {topPostsChartData.length === 0 ? (
                <p className="text-slate text-sm text-center py-6">No upvoted posts yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topPostsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8B92A8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#8B92A8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0B0E14", border: "none", borderRadius: "8px", fontSize: "12px" }}
                      labelStyle={{ color: "#F5F3EE" }}
                      formatter={(value, _, props) => [
                        `${value} votes`,
                        props.payload.fullText?.substring(0, 30) + "..."
                      ]}
                    />
                    <Bar dataKey="votes" fill="#FF6B4A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-surface rounded-2xl p-5 border border-white/5">
              <p className="font-display text-sm font-semibold text-paper mb-4">Platform balance</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={userVsPostsData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {userVsPostsData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0B0E14", border: "none", borderRadius: "8px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {userVsPostsData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }}></span>
                    <span className="text-slate text-xs">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div>
            {allPosts.length === 0 ? (
              <p className="text-slate text-sm text-center py-8">No posts yet.</p>
            ) : (
              allPosts.map((post) => (
                <div key={post._id} className="bg-surface rounded-xl p-4 mb-2.5 border border-white/5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-paper text-sm break-words mb-2">{post.post}</p>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate">
                      <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <span className="truncate max-w-[160px]">{post.userId?.email || "Unknown"}</span>
                      <span className="text-ember">{post.votes} votes</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="text-[11px] font-medium text-ember hover:text-ember/70 flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div>
            {allUsers.length === 0 ? (
              <p className="text-slate text-sm text-center py-8">No users yet.</p>
            ) : (
              allUsers.map((user) => (
                <div key={user._id} className="bg-surface rounded-xl p-4 mb-2.5 border border-white/5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-paper text-sm font-medium truncate max-w-[220px]">{user.email}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      user.role === "admin" ? "bg-violet/15 text-violet" : "bg-white/5 text-slate"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate flex-shrink-0">
                    {user.posts?.length || 0} posts
                  </span>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}