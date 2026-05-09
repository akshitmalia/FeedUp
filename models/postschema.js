const mongoose = require("mongoose");

const feedschema = new mongoose.Schema({
  post: { type: String, required: true },
  votes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  upvotedBy: { type: [mongoose.Schema.Types.ObjectId], default: [] }
});

const feed = mongoose.model("Feed", feedschema);
module.exports = feed;