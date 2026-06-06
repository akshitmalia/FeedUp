const jwt = require("jsonwebtoken");
const User = require("../models/userschema");
require("dotenv").config();

const secret = process.env.topSecret;

async function authenticate(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, secret);

    // Checking if user is blocked
    const user = await User.findById(decoded.id).select("isBlocked");
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.isBlocked) {
      res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "None" });
      return res.status(403).json({ error: "Your account has been blocked" });
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = authenticate;