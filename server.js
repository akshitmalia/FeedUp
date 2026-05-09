require("dotenv").config();

const express=require("express");
const cors=require("cors");
const path=require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
connectDB();



///////////////////////////////////// to CHANGE IT
const PORT=3000 || process.env.PORT ; // later need to be changed || for render deployment
const app=express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
 
//////////////////////////////////// url connection with routes//////////////////////

app.use(express.static(path.join(__dirname, "public")));

app.use("/feedup", authRoutes);

app.get("/akshit/", (req, res) => {
    res.send("API is running fine.");
});


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