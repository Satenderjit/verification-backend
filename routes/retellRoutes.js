const express = require("express");
const router = express.Router();
// Dhyan dein: Hum 'handleRetellWebhook' import kar rahe hain
const { handleRetellWebhook } = require("../controllers/retellController");

// POST request handle karega jab Retell aapke server par data bhejega
router.post("/webhook", handleRetellWebhook);

module.exports = router;