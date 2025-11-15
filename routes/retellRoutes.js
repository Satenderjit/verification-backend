const express = require("express");
const router = express.Router();

const { retellWebhook } = require("../controllers/retellController");

// Retell AI Webhook endpoint (POST)
router.post("/webhook", retellWebhook);

module.exports = router;
