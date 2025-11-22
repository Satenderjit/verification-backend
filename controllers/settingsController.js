const Settings = require("../models/Settings");

// Get current status
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update status
exports.updateSettings = async (req, res) => {
  try {
    const { appointment, pickup, speakToHuman } = req.body;
    let settings = await Settings.findOne();
    
    if (!settings) settings = new Settings();
    
    settings.appointment = appointment;
    settings.pickup = pickup;
    settings.speakToHuman = speakToHuman;
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};