require("dotenv").config({ path: "./backend/.env" });

const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");

const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");
const adminRoutes = require("./routes/adminRoutes");

connectDB();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));


// API routes
app.use("/feedup", authRoutes);
app.use("/feedup", feedRoutes);
app.use("/admin", adminRoutes);

// Health check
app.get("/akshit/", (req, res) => {
  res.send("API is running fine.");
});

app.get("/feedup/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.topSecret);
    res.json({ email: decoded.email, role: decoded.role });
  } catch (err) {
    console.error("JWT verify failed:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.use(cors({
  origin: "https://feed-up-puce.vercel.app", // exact frontend domain
  credentials: true
}));




// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
  });
}

// Error handlers
app.use((req, res, next) => {
  res.status(404).json({ error: "Route Not Found" });
});

app.use((err, req, res, next) => {
  console.log("Unexpected err", err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log("SERVER IS RUNNING SO IS AKSHIT !!!");
});