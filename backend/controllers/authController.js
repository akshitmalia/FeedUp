const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userschema");
require("dotenv").config();

const secret = process.env.topSecret;

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email or Password not provided" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashPassword = bcrypt.hashSync(password, 8);
    const newUser = new User({ email, password: hashPassword, posts: [] });
    await newUser.save();


const token = jwt.sign(
  { id: newUser._id, email: newUser.email, role: newUser.role }, //role addedd fo r it now 
  secret,
  { expiresIn: "1d" }
);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({ message: "User registered successfully", role: newUser.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email or Password not provided" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found. Please register first." });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

const token = jwt.sign(
  { id: user._id, email: user.email, role: user.role }, // changesd here 
  secret,
  { expiresIn: "1d" }
);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({ message: "Login successful", role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



module.exports = { registerUser, loginUser };