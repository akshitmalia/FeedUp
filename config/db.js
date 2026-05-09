const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

const connectDB = async () => {
  mongoose.connect(uri)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("Connection error:", err));
};

module.exports = connectDB;