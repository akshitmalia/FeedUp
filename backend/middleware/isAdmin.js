const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.topSecret;

function isAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = isAdmin;