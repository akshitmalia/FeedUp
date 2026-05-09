const mongoose=require("mongoose")

const feedschema = new mongoose.Schema({
  post: { type: String, required: true },
  votes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }, 
  userId: { type: String, required: true, unique: true } 
});
const feed=mongoose.model("feed",feedschema);