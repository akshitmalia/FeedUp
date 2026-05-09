const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.topSecret;

function authenticate(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/feedup/login");

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch {
    res.redirect("/feedup/login");
  }
}

module.exports = authenticate;