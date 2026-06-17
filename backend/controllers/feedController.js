const Feed = require("../models/postschema");
const User = require("../models/userschema");

// Create a new post
const createPost = async (req, res) => {
  try {
    const { post } = req.body;
    if (!post) return res.status(400).json({ error: "No post provided" });

    const newFeed = new Feed({
      post,
      userId: req.user.id
    });
    await newFeed.save();

    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { posts: newFeed._id } }
    );

    // Broadcast new post to every connected client
    req.io.emit("post:created", newFeed);

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

    if (feed.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to delete this post" });
    }

    await Feed.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { posts: feed._id } }
    );

    // Broadcast deletion — only _id needed since frontend just filters it out
    req.io.emit("post:deleted", { _id: req.params.id });

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

    if (feed.userId.toString() === req.user.id) {
      return res.status(403).json({ error: "Cannot upvote your own post" });
    }

    const alreadyUpvoted = feed.upvotedBy.includes(req.user.id);

    let updatedFeed;
    if (alreadyUpvoted) {
      updatedFeed = await Feed.findByIdAndUpdate(req.params.id, {
        $pull: { upvotedBy: req.user.id },
        $inc: { votes: -1 }
      }, { new: true });
    } else {
      updatedFeed = await Feed.findByIdAndUpdate(req.params.id, {
        $push: { upvotedBy: req.user.id },
        $inc: { votes: 1 }
      }, { new: true });
    }

    // Broadcast new vote count — only _id and votes needed, nothing else changed
    req.io.emit("post:upvoted", { _id: req.params.id, votes: updatedFeed.votes });

    return res.json({ message: alreadyUpvoted ? "Upvote removed" : "Upvoted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update my post
const updatePost = async (req, res) => {
  try {
    const { post } = req.body;
    if (!post) return res.status(400).json({ error: "No post provided" });

    const feed = await Feed.findById(req.params.id);
    if (!feed) return res.status(404).json({ error: "Post not found" });

    if (feed.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to update this post" });
    }

    const updatedFeed = await Feed.findByIdAndUpdate(
      req.params.id,
      { post },
      { new: true }
    );

    // Broadcast updated post — full object since text content changed
    req.io.emit("post:updated", updatedFeed);

    res.json({ message: "Post updated successfully", feed: updatedFeed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Signout — cookie attributes MUST match how it was set in authController
const signOut = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.json({ message: "Logged out successfully" });
};

module.exports = { createPost, getAllPosts, getTopPosts, getMyPosts, updatePost, deletePost, upvotePost, signOut };