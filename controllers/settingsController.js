const Settings = require("../models/Settings");

// GET current settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // If settings do not exist, create default one
    if (!settings) {
      settings = await Settings.create({
        appointment: false,
        pickup: false,
        speakToHuman: false,
      });
    }

    res.json(settings);
  } catch (error) {
    console.log("Get Settings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE settings
const updateSettings = async (req, res) => {
  try {
    const { appointment, pickup, speakToHuman } = req.body;

    let settings = await Settings.findOne();

    // Create one if not exists
    if (!settings) {
      settings = await Settings.create({});
    }

    settings.appointment = appointment;
    settings.pickup = pickup;
    settings.speakToHuman = speakToHuman;

    await settings.save();

    res.json({ message: "Settings updated", settings });
  } catch (error) {
    console.log("Update Settings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getSettings, updateSettings };
