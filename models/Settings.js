const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  appointment: {
    type: Boolean,
    default: false,
  },
  pickup: {
    type: Boolean,
    default: false,
  },
  speakToHuman: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model("Settings", SettingsSchema);
