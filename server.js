// server.js

require('dotenv').config(); 

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); 

connectDB(); 

const app = express();

const allowedOrigins = [
  "https://verification-frontend-retell.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith("http://localhost:")) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/retell", require("./routes/retellRoutes"));
app.use("/api/auth", require("./routes/authRoutes")); 

app.listen(process.env.PORT || 5000, () => 
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
