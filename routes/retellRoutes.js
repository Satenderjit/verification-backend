const express = require("express");
const router = express.Router();

const { handleRetellWebhook } = require("../controllers/retellController");

router.post("/webhook", handleRetellWebhook);

module.exports = router;
