const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");
const path = require("path");

// Page routes
router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/register.html"));
});

router.get("/", authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/feedup.html"));
});

// API routes
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;