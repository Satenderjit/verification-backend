const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  appointment: { type: Boolean, default: true },
  pickup: { type: Boolean, default: true },
  speakToHuman: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Settings", SettingsSchema);