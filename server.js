// server.js

// 💡 FIX 1: Loads variables from the local .env file
require('dotenv').config(); 

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); 

// Attempt to connect to MongoDB
connectDB(); 

const app = express();

// 💡 FIX 2: Explicitly list the exact Vercel URL causing the CORS error
const allowedOrigins = [
  "https://verification-frontend-retell.vercel.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow no-origin requests (e.g., Postman, Retell webhook)
    if (!origin) return callback(null, true);
    
    // 2. Allow any localhost during local development
    if (origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }
    
    // 3. Allow the deployed Vercel frontend
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Block everything else (This is line 27 where your error occurred)
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true
}));


app.use(express.json());

// Routes
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/retell", require("./routes/retellRoutes"));
app.use("/api/auth", require("./routes/authRoutes")); 


// Use process.env.PORT for Render, otherwise use 5000
app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));