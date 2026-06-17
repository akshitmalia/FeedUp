require("dotenv").config({ path: "./backend/.env" });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");
const adminRoutes = require("./routes/adminRoutes");

connectDB();

const PORT = process.env.PORT || 3000;
const app = express();


const httpServer = http.createServer(app);


const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }
});


app.use((req, res, next) => {
  req.io = io;
  next();
});


app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// API routes
app.use("/feedup", authRoutes);
app.use("/feedup", feedRoutes);
app.use("/admin", adminRoutes);

// Health check
app.get("/akshit/", (req, res) => {
  res.send("API is running fine.");
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Route Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.log("Unexpected err", err);
  res.status(500).json({ error: "Something went wrong" });
});


httpServer.listen(PORT, () => {
  console.log("SERVER IS RUNNING SO IS AKSHIT !!!");
});