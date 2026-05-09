const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  createPost,
  getAllPosts,
  getTopPosts,
  getMyPosts,
  deletePost,
  upvotePost,
  signOut
} = require("../controllers/feedController");

// All routes are protected by authenticate middleware
router.get("/posts", authenticate, getAllPosts);
router.get("/posts/top", authenticate, getTopPosts);
router.get("/posts/my", authenticate, getMyPosts);
router.post("/posts", authenticate, createPost);
router.delete("/posts/:id", authenticate, deletePost);
router.patch("/posts/:id/upvote", authenticate, upvotePost);
router.get("/signout", authenticate, signOut);

module.exports = router;