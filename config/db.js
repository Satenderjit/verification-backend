const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://situ:situ@verification-retell.kd7mnhs.mongodb.net/?appName=verification-retell");
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("DB Error:", error);
  }
};

module.exports = connectDB;
