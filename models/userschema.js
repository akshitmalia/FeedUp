const mongoose=require("mongoose");


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  posts: { type: [String], default: [] }
});

module.exports = mongoose.model("User", userSchema);//we can aad third arg here for particular collectionname