import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAllPosts, setTopPosts, setMyPosts } from "../redux/slices/feedSlice";
import {
  getAllPostsAPI,
  getTopPostsAPI,
  getMyPostsAPI,
  createPostAPI,
  deletePostAPI,
  updatePostAPI,
  upvotePostAPI,
} from "../api/feedAPI";
import Navbar from "../components/Navbar";

export default function Home() {
  const dispatch = useDispatch();
  const { allPosts, topPosts, myPosts } = useSelector((state) => state.feed);
  const { user } = useSelector((state) => state.auth);

  const [newPost, setNewPost] = useState("");
  const [editPostId, setEditPostId] = useState(null);
  const [editText, setEditText] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "top", "my"
  const [loading, setLoading] = useState(false);

  // Fetch all posts on page load
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [allRes, topRes, myRes] = await Promise.all([
        getAllPostsAPI(),
        getTopPostsAPI(),
        getMyPostsAPI(),
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

  // Create post
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

  // Delete post
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePostAPI(id);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  // Update post
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

  // Upvote post
  const handleUpvote = async (id) => {
    try {
      await upvotePostAPI(id);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to upvote");
    }
  };

  // Post Card Component
  const PostCard = ({ feed, showDelete = false, showUpvote = true }) => (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      {editPostId === feed._id ? (
        // Edit mode
        <div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdate(feed._id)}
              className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              Save
            </button>
            <button
              onClick={() => { setEditPostId(null); setEditText(""); }}
              className="px-4 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // View mode
        <div>
          <p className="text-gray-800 mb-2">{feed.post}</p>
          <small className="text-gray-400 text-xs">
            {new Date(feed.createdAt).toLocaleString()}
          </small>
          <div className="flex items-center gap-2 mt-3">
            {showUpvote && (
              <button
                onClick={() => handleUpvote(feed._id)}
                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition text-sm font-medium"
              >
                ▲ {feed.votes}
              </button>
            )}
            {showDelete && (
              <>
                <button
                  onClick={() => {
                    setEditPostId(feed._id);
                    setEditText(feed.post);
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(feed._id)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Create Post Section */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-600 mb-4">Create Feed</h2>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Type your thoughts here..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreatePost}
            className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Post
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "top", "my"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "all" ? "All Feeds" : tab === "top" ? "Top Feed" : "My Posts"}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        )}

        {/* All Feeds Tab */}
        {!loading && activeTab === "all" && (
          <div>
            <h2 className="text-xl font-bold text-blue-600 mb-4">All Feeds</h2>
            {allPosts.length === 0 ? (
              <p className="text-center text-gray-400">No posts yet!</p>
            ) : (
              allPosts.map((feed) => (
                <PostCard key={feed._id} feed={feed} showUpvote={true} />
              ))
            )}
          </div>
        )}

        {/* Top Feed Tab */}
        {!loading && activeTab === "top" && (
          <div>
            <h2 className="text-xl font-bold text-green-600 mb-4">Top Feed</h2>
            {topPosts.length === 0 ? (
              <p className="text-center text-gray-400">No upvoted posts yet!</p>
            ) : (
              topPosts.map((feed) => (
                <PostCard key={feed._id} feed={feed} showUpvote={false} />
              ))
            )}
          </div>
        )}

        {/* My Posts Tab */}
        {!loading && activeTab === "my" && (
          <div>
            <h2 className="text-xl font-bold text-red-600 mb-4">My Posts</h2>
            {myPosts.length === 0 ? (
              <p className="text-center text-gray-400">No posts by you yet!</p>
            ) : (
              myPosts.map((feed) => (
                <PostCard key={feed._id} feed={feed} showDelete={true} showUpvote={false} />
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}