require("dotenv").config();

const express=require("express");
const cors=require("cors");
const path=require("path");
const bcrypt=require("bcryptjs")
const User = require("./models/userschema");
const Post = require("./models/postschema");
const cookieParser = require("cookie-parser");
const authenticate = require("./middleware/authenticate");
const connectDB = require("./config/db");
connectDB();

const jwt = require("jsonwebtoken");
const secret = process.env.topSecret;


///////////////////////////////////// to CHANGE IT
const PORT=3000 ; // later need to be changed || for render deployment
const app=express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
 
//////////////////////////////////// url connection with routes//////////////////////

app.use(express.static(path.join(__dirname, "public"))); //runs the localhost:3000/index.html



// route for register page
// app.get("/feedup/register",(req,res)=>{
//     res.sendFile(path.join(__dirname, "public", "register.html"));
// });

app.get("/feedup",authenticate,(req,res)=>{
    res.sendFile(path.join(__dirname,"public","feedup.html"));
});

//route for login page
app.get("/feedup/login",(req,res)=>{
    res.sendFile(path.join(__dirname,"public","login.html"));
});

app.get("/feedup/register",(req,res)=>{
    res.sendFile(path.join(__dirname,"public","register.html"));
});
//route for feedup MAIN PAGE ----> TO SHOW THIS ONLY WHEN USER HAS REGISTERED OR LOGIN not before that
//ADD AUTHENTICATION JWT into it
// app.get("/feedup/",authenticate,(req,res)=>{
//     res.sendFile(path.join(__dirname,"public","feedup.html"));
// });
//route health api check
app.get("/akshit/",(req,res)=>{
    res.send("API is running fine.");
});



/////////////////////////RESTful APIs ////////////////////////////////////////////
app.post("/feedup/register", async (req, res) => {
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

    // Generate JWT immediately
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      secret,
      { expiresIn: "1d" }
    );

    // Step 3: set cookie instead of returning token
    res.cookie("token", token, {
      httpOnly: true,       // not accessible via JS    
      //set true if using HTTPS
      secure: true,
sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// app.post("/feedup/register", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: "Email or Password not provided" });
//     }

//     // check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already registered" });
//     }

//     // hash password
//     const hashPassword = bcrypt.hashSync(password, 8);

//     // create new user document
//     const newUser = new User({
//       email,
//       password: hashPassword,
//       posts: []
//     });

//     // save to MongoDB
//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully", user: newUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

app.post("/feedup/login", async (req, res) => {
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

    // Generate JWT immediately
    const token = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: "1d" }
    );

    // Set cookie instead of returning token
    res.cookie("token", token, {
      httpOnly: true,       // not accessible via JS
      secure: false,        // set true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/////////////////////// Authenticate FUNCTION ///////////////////////
// function authenticate(req, res, next) {
//   const token = req.cookies.token;
//   if (!token) return res.redirect("/feedup/login");

//   try {
//     const decoded = jwt.verify(token, secret);
//     req.user = decoded;
//     next();
//   } catch {
//     res.redirect("/feedup/login");
//   }
// }



//middleware for error handling route handler
app.use((req,res,next)=>{
    res.status(404).json({
        error:"Route Not Found"
    });
});

app.use((err,req,res,next)=>{
    console.log("Unexpected err",err);
    res.status(500).json({error:"Something went wrong"});
});


app.listen(PORT,()=>{
    console.log("SERVER IS RUNNING SO IS AKSHIT !!!");
});