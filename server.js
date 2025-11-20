// server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "https://verification-frontend-retell.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman, Retell Webhook, and server-to-server calls
      if (!origin) return callback(null, true);

      // Allow localhost during development
      if (origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }

      // Allow your deployed frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Block everything else
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/retell", require("./routes/retellRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
