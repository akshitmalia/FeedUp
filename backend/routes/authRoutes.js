const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");
 
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticate, getMe); // rehydrates Redux on page refresh
 
module.exports = router;