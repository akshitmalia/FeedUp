import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAllPosts, setTopPosts, setMyPosts } from "../redux/slices/feedSlice";
import {
  getAllPostsAPI, getTopPostsAPI, getMyPostsAPI,
  createPostAPI, deletePostAPI, updatePostAPI, upvotePostAPI,
} from "../api/feedAPI";
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
    if (!newPost.trim()) return alert("Please write something!");
    try {
      await createPostAPI({ post: newPost });
      setNewPost("");
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to post");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePostAPI(id);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleUpdate = async (id) => {
    if (!editText.trim()) return alert("Post cannot be empty!");
    try {
      await updatePostAPI(id, { post: editText });
      setEditPostId(null);
      setEditText("");
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update");
    }
  };

  const handleUpvote = async (id) => {
    try {
      await upvotePostAPI(id);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to upvote");
    }
  };

  // Shared props passed down to every PostCard
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Create Post — extracted to FeedForm component */}
        <FeedForm
          value={newPost}
          onChange={setNewPost}
          onSubmit={handleCreatePost}
        />

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {["all", "top", "my"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "all" ? "All Feeds" : tab === "top" ? "Top" : "My Posts"}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        )}

        {!loading && activeTab === "all" && (
          <div>
            <h2 className="text-lg font-bold text-blue-600 mb-4">All Feeds</h2>
            {allPosts.length === 0
              ? <p className="text-center text-gray-400">No posts yet!</p>
              : allPosts.map((feed) => (
                  <PostCard key={feed._id} feed={feed} showUpvote={true} {...cardProps} />
                ))
            }
          </div>
        )}

        {!loading && activeTab === "top" && (
          <div>
            <h2 className="text-lg font-bold text-green-600 mb-4">Top Feed</h2>
            {topPosts.length === 0
              ? <p className="text-center text-gray-400">No upvoted posts yet!</p>
              : topPosts.map((feed) => (
                  <PostCard key={feed._id} feed={feed} showUpvote={false} {...cardProps} />
                ))
            }
          </div>
        )}

        {!loading && activeTab === "my" && (
          <div>
            <h2 className="text-lg font-bold text-red-600 mb-4">My Posts</h2>
            {myPosts.length === 0
              ? <p className="text-center text-gray-400">No posts by you yet!</p>
              : myPosts.map((feed) => (
                  <PostCard key={feed._id} feed={feed} showDelete={true} showUpvote={false} {...cardProps} />
                ))
            }
          </div>
        )}

      </div>
    </div>
  );
}