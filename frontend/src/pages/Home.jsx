import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllPosts, setTopPosts, setMyPosts,
  socketPostCreated, socketPostDeleted, socketPostUpvoted, socketPostUpdated
} from "../redux/slices/feedSlice";
import {
  getAllPostsAPI, getTopPostsAPI, getMyPostsAPI,
  createPostAPI, deletePostAPI, updatePostAPI, upvotePostAPI,
} from "../api/feedAPI";
import socket from "../api/socket";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import FeedForm from "../components/FeedForm";

export default function Home() {
  const dispatch = useDispatch();
  const { allPosts, topPosts, myPosts } = useSelector((state) => state.feed);

  const [newPost, setNewPost]       = useState("");
  const [editPostId, setEditPostId] = useState(null);
  const [editText, setEditText]     = useState("");
  const [activeTab, setActiveTab]   = useState("all");
  const [loading, setLoading]       = useState(false);

  useEffect(() => { fetchAllData(); }, []);

  useEffect(() => {
    socket.on("post:created", (post) => dispatch(socketPostCreated(post)));
    socket.on("post:deleted", (data) => dispatch(socketPostDeleted(data)));
    socket.on("post:upvoted", (data) => dispatch(socketPostUpvoted(data)));
    socket.on("post:updated", (post) => dispatch(socketPostUpdated(post)));

    return () => {
      socket.off("post:created");
      socket.off("post:deleted");
      socket.off("post:upvoted");
      socket.off("post:updated");
    };
  }, [dispatch]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [allRes, topRes, myRes] = await Promise.all([
        getAllPostsAPI(), getTopPostsAPI(), getMyPostsAPI(),
      ]);
      dispatch(setAllPosts(allRes.data));
      dispatch(setTopPosts(topRes.data));
      dispatch(setMyPosts(myRes.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return alert("Write something first.");
    try {
      await createPostAPI({ post: newPost });
      setNewPost("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to post");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePostAPI(id);
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
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update");
    }
  };

  const handleUpvote = async (id) => {
    try {
      await upvotePostAPI(id);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to upvote");
    }
  };

  const cardProps = {
    editPostId,
    editText,
    onEditStart:  (id, text) => { setEditPostId(id); setEditText(text); },
    onEditChange: (text) => setEditText(text),
    onEditSave:   handleUpdate,
    onEditCancel: () => { setEditPostId(null); setEditText(""); },
    onDelete:     handleDelete,
    onUpvote:     handleUpvote,
  };

  const tabs = [
    { key: "all", label: "Feed" },
    { key: "top", label: "Top" },
    { key: "my",  label: "Yours" },
  ];

  const activeData = activeTab === "all" ? allPosts : activeTab === "top" ? topPosts : myPosts;
  const emptyMessage =
    activeTab === "all" ? "Nothing's been said yet. Be the first." :
    activeTab === "top" ? "No upvoted posts yet." :
    "You haven't posted anything yet.";

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">

        <FeedForm
          value={newPost}
          onChange={setNewPost}
          onSubmit={handleCreatePost}
        />

        {/* Tabs — underline style instead of filled pills */}
        <div className="flex gap-6 mb-5 border-b border-white/5">
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

        {loading ? (
          <div className="text-center text-slate py-12 font-mono text-sm">Loading feed...</div>
        ) : activeData.length === 0 ? (
          <div className="text-center text-slate py-12 text-sm">{emptyMessage}</div>
        ) : (
          activeData.map((feed) => (
            <PostCard
              key={feed._id}
              feed={feed}
              showUpvote={activeTab !== "top"}
              showDelete={activeTab === "my"}
              {...cardProps}
            />
          ))
        )}

      </div>
    </div>
  );
}