const Feed = require("../models/postschema");
const User = require("../models/userschema");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get dashboard stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Feed.countDocuments();
    const topPosts = await Feed.find({ votes: { $gt: 0 } })
      .sort({ votes: -1 })
      .limit(5);

    res.json({ totalUsers, totalPosts, topPosts });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get all posts with admin view
const getAllPostsAdmin = async (req, res) => {
  try {
    const feeds = await Feed.find()
      .sort({ votes: -1 })
      .populate("userId", "email role");
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete any post (admin power)
const deleteAnyPost = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) return res.status(404).json({ error: "Post not found" });

    await Feed.findByIdAndDelete(req.params.id);

    // Remove from user's posts array
    await User.findByIdAndUpdate(
      feed.userId,
      { $pull: { posts: feed._id } }
    );

    res.json({ message: "Post deleted by admin" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Block or unblock a user
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Cannot block another admin
    if (user.role === "admin") {
      return res.status(403).json({ error: "Cannot block an admin" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: user.isBlocked ? "User blocked" : "User unblocked",
      isBlocked: user.isBlocked
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get user dashboard stats
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const myPosts = await Feed.find({ userId }).sort({ createdAt: -1 });
    const totalPosts = myPosts.length;
    const totalUpvotes = myPosts.reduce((sum, post) => sum + post.votes, 0);

    res.json({ totalPosts, totalUpvotes, myPosts });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  getStats,
  getAllPostsAdmin,
  deleteAnyPost,
  toggleBlockUser,
  getUserStats
};