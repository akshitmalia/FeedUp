import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import { getUserStatsAPI } from "../api/adminAPI";
import { deletePostAPI, updatePostAPI } from "../api/feedAPI";
import Navbar from "../components/Navbar";

const BARCOLORS = ["#FF6B4A", "#6C63FF", "#8B92A8"];

export default function UserDashboard() {
  const { role } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editPostId, setEditPostId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getUserStatsAPI();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePostAPI(id);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleUpdate = async (id) => {
    if (!editText.trim()) return alert("Post cannot be empty.");
    try {
      await updatePostAPI(id, { post: editText });
      setEditPostId(null);
      setEditText("");
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update");
    }
  };

  const chartData = stats?.myPosts?.slice(0, 6).reverse().map((post, i) => ({
    name: `#${i + 1}`,
    votes: post.votes,
  })) || [];

  const avgVotes = stats?.totalPosts > 0 ? (stats.totalUpvotes / stats.totalPosts).toFixed(1) : "0.0";

  if (loading) return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="text-center text-slate py-20 font-mono text-sm">Loading your activity...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header — distinct from Home's tone, this is personal not social */}
        <div className="mb-8">
          <p className="font-mono text-[11px] text-violet uppercase tracking-widest mb-1">
            {role === "admin" ? "Admin · Personal view" : "Your activity"}
          </p>
          <h1 className="font-display text-2xl font-bold text-paper">
            How you've shown up
          </h1>
        </div>

        {/* Stat row — numbers as the focus, mono font like a ledger */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <p className="text-slate text-[11px] font-medium uppercase tracking-wide mb-2">Posts</p>
            <p className="font-mono text-3xl font-bold text-paper">{stats?.totalPosts || 0}</p>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <p className="text-slate text-[11px] font-medium uppercase tracking-wide mb-2">Upvotes</p>
            <p className="font-mono text-3xl font-bold text-ember">{stats?.totalUpvotes || 0}</p>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <p className="text-slate text-[11px] font-medium uppercase tracking-wide mb-2">Avg / post</p>
            <p className="font-mono text-3xl font-bold text-violet">{avgVotes}</p>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="bg-surface rounded-2xl p-5 mb-8 border border-white/5">
            <p className="font-display text-sm font-semibold text-paper mb-4">Recent post performance</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8B92A8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8B92A8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1A1F2B", border: "none", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "#F5F3EE" }}
                />
                <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={BARCOLORS[i % BARCOLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Post management — only place edit/delete for own posts lives now */}
        <div>
          <p className="font-display text-sm font-semibold text-paper mb-4">Manage your posts</p>

          {!stats?.myPosts?.length ? (
            <p className="text-slate text-sm py-8 text-center">Nothing here yet.</p>
          ) : (
            stats.myPosts.map((post) => (
              <div key={post._id} className="bg-surface rounded-xl p-4 mb-2.5 border border-white/5">
                {editPostId === post._id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full bg-ink border border-violet/30 rounded-lg p-3 text-paper text-sm mb-3 focus:outline-none focus:border-violet resize-none"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => handleUpdate(post._id)} className="text-xs font-medium text-violet hover:text-violet/70">
                        Save changes
                      </button>
                      <button onClick={() => { setEditPostId(null); setEditText(""); }} className="text-xs font-medium text-slate hover:text-paper">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-paper text-sm leading-relaxed break-words mb-2">{post.post}</p>
                      <span className="font-mono text-[11px] text-slate">
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {' · '}{post.votes} votes
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <button onClick={() => { setEditPostId(post._id); setEditText(post.post); }} className="text-[11px] font-medium text-violet hover:text-violet/70">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(post._id)} className="text-[11px] font-medium text-ember hover:text-ember/70">
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}