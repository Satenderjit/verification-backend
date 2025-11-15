const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const settingsRoutes = require("./routes/settingsRoutes");

connectDB(); // hardcoded MongoDB URI

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/settings", settingsRoutes);
app.use("/api/retell", require("./routes/retellRoutes"));


app.listen(5000, () => console.log("Server running on port 5000"));
