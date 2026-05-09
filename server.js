require("dotenv").config();

const express=require("express");
const cors=require("cors");
const path=require("path");
const { registerUser, loginUser } = require("./controllers/authController");
const Post = require("./models/postschema");
const cookieParser = require("cookie-parser");
const authenticate = require("./middleware/authenticate");
const connectDB = require("./config/db");
connectDB();



///////////////////////////////////// to CHANGE IT
const PORT=3000 ; // later need to be changed || for render deployment
const app=express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
 
//////////////////////////////////// url connection with routes//////////////////////

app.use(express.static(path.join(__dirname, "public"))); //runs the localhost:3000/index.html




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
app.post("/feedup/register", registerUser);
app.post("/feedup/login", loginUser);

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