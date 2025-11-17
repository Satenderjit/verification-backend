// config/db.js

const mongoose = require("mongoose");

const connectDB = async () => { // <--- MUST BE DEFINED AS A FUNCTION
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected successfully using ENV variable.");
  } catch (error) {
    console.error("DB Error:", error);
  }
};

module.exports = connectDB; // <--- MUST EXPORT THE FUNCTION DIRECTLY