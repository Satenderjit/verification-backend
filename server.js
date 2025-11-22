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
// 1. SECURITY (CORS) - PRODUCTION MODE
// ==========================================

// Only allow your specific Vercel Frontend
const allowedOrigins = [
  "https://verification-frontend-ny58p24l5-satenders-projects-f218d133.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // (A) Allow requests with no origin (like Retell Webhooks, Postman, Mobile Apps)
      if (!origin) return callback(null, true);

      // (B) Block any origin that is NOT in the allowed list
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// ==========================================
// 2. DATABASE CONNECTION
// ==========================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// ==========================================
// 3. API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/retell", retellRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.send("Backend is running in Production Mode.");
});

// ==========================================
// 4. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});