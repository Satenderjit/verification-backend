require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const retellRoutes = require("./routes/retellRoutes");

const app = express();

// ==========================================
// 1. MIDDLEWARE & SECURITY
// ==========================================

// Define allowed origins (Your Frontend URL)
// Add your Vercel URL here when deployed
const allowedOrigins = [
  "http://localhost:3000", 
  "http://localhost:5173",
  "https://verification-frontend-retell.vercel.app" 
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, or Retell Webhook)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json()); // Parse incoming JSON requests

// ==========================================
// 2. DATABASE CONNECTION
// ==========================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Stop server if DB fails
  }
};

// Connect to Database
connectDB();

// ==========================================
// 3. API ROUTES
// ==========================================

// Auth Routes (Login/Register for Admin Dashboard)
app.use("/api/auth", authRoutes);

// Settings Routes (Get/Update Toggles)
app.use("/api/settings", settingsRoutes);

// Retell AI Webhook (The Workflow Logic)
app.use("/api/retell", retellRoutes);

// Default Route (Health Check)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ==========================================
// 4. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});