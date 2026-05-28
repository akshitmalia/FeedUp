const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const authenticate = require("../middleware/authenticate");
const {
  getAllUsers,
  getStats,
  getAllPostsAdmin,
  deleteAnyPost,
  toggleBlockUser,
  getUserStats
} = require("../controllers/adminController");

// User dashboard stats — any logged in user
router.get("/user/stats", authenticate, getUserStats);

// Admin only routes
router.get("/stats", isAdmin, getStats);
router.get("/users", isAdmin, getAllUsers);
router.get("/posts", isAdmin, getAllPostsAdmin);
router.delete("/posts/:id", isAdmin, deleteAnyPost);
router.patch("/users/:id/block", isAdmin, toggleBlockUser);

module.exports = router;