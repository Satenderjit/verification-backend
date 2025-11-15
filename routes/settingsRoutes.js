const express = require("express");
const router = express.Router();

const { getSettings, updateSettings } = require("../controllers/settingsController");

// GET → fetch current toggle values
router.get("/", getSettings);

// PUT → update toggles
router.put("/update", updateSettings);

module.exports = router;
