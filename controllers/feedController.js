const Feed = require("../models/postschema");
const User = require("../models/userschema");

// Create a new post
const createPost = async (req, res) => {
  try {
    const { post } = req.body;
    if (!post) return res.status(400).json({ error: "No post provided" });

    // Create new feed with userId from JWT cookie
    const newFeed = new Feed({
      post,
      userId: req.user.id
    });
    await newFeed.save();

    // Also store post reference in user's posts array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { posts: newFeed._id } }
    );

    res.status(201).json({ message: "Post created successfully", feed: newFeed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const feeds = await Feed.find().sort({ createdAt: -1 });
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get top posts by votes
const getTopPosts = async (req, res) => {
  try {
    const feeds = await Feed.find({ votes: { $gt: 0 } })
      .sort({ votes: -1 })
      .limit(5);
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get my posts
const getMyPosts = async (req, res) => {
  try {
    const feeds = await Feed.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete my post
const deletePost = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) return res.status(404).json({ error: "Post not found" });

    // Only owner can delete
    if (feed.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to delete this post" });
    }

    await Feed.findByIdAndDelete(req.params.id);

    // Remove post reference from user's posts array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { posts: feed._id } }
    );

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Upvote / undo upvote
const upvotePost = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) return res.status(404).json({ error: "Post not found" });

    // Cannot upvote your own post
    if (feed.userId.toString() === req.user.id) {
      return res.status(403).json({ error: "Cannot upvote your own post" });
    }

    const alreadyUpvoted = feed.upvotedBy.includes(req.user.id);

    if (alreadyUpvoted) {
      // Undo upvote
      await Feed.findByIdAndUpdate(req.params.id, {
        $pull: { upvotedBy: req.user.id },
        $inc: { votes: -1 }
      });
      return res.json({ message: "Upvote removed" });
    } else {
      // Add upvote
      await Feed.findByIdAndUpdate(req.params.id, {
        $push: { upvotedBy: req.user.id },
        $inc: { votes: 1 }
      });
      return res.json({ message: "Upvoted successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Signout
const signOut = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax"
  });
  res.redirect("/feedup/login");
};

module.exports = { createPost, getAllPosts, getTopPosts, getMyPosts, deletePost, upvotePost, signOut };