// server.js (UPDATED FILE)

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const settingsRoutes = require("./routes/settingsRoutes");

connectDB(); // hardcoded MongoDB URI

const app = express();

const allowedOrigins = [
  "https://verification-frontend-retell.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow no-origin requests (mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // Allow any localhost port
    if (origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }

    // Allow deployed frontend
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Block everything else
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true
}));


app.use(express.json());

app.use("/api/settings", settingsRoutes);
app.use("/api/retell", require("./routes/retellRoutes"));
// 👇 ADD THIS LINE
app.use("/api/auth", require("./routes/authRoutes")); 


app.listen(5000, () => console.log("Server running on port 5000"));