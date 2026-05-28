const mongoose=require("mongoose");


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feed" }],
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isBlocked: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);//we can aad third arg here for particular collectionname