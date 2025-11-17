// controllers/retellController.js
const Settings = require("../models/Settings");
const retellClient = require("../config/retellClient");

// Retell AI webhook handler
const retellWebhook = async (req, res) => {
  try {
    // Load current toggle settings
    const settings = await Settings.findOne();

    // 💡 FIX 1: Prevent crash if the database connection failed or settings document is missing/not created.
    if (!settings) {
      return res.status(404).json({
        message: "Settings document not found in DB. Please use the Admin Dashboard to initialize.",
        allow: false,
      });
    }

    // 💡 FIX 2: Prevent crash if req.body is undefined (e.g., Retell sends a call start event without a message).
    if (!req.body || !req.body.message) {
        return res.json({
            allow: true,
            action: null,
            reply: "" // Send an empty reply to continue the conversation flow (if any)
        });
    }

    // Get user message from Retell AI
    const userMessage = req.body.message.toLowerCase();

    // Initialize response
    let response = {
      allow: true,
      action: null,
      reply: "How can I assist you today?",
    };

    // Check Appointment intent
    if (userMessage.includes("appointment")) {
      if (settings.appointment) {
        response = {
          allow: true,
          action: "appointment_flow",
          reply: "Sure, I can help with the appointment. What date would you like?",
        };
      } else {
        response = {
          allow: false,
          reply: "Sorry, appointment booking is currently disabled by admin.",
        };
      }
      return res.json(response);
    }

    // Check Cheque / Letter Pickup intent
    if (
      userMessage.includes("cheque") ||
      userMessage.includes("letter") ||
      userMessage.includes("pickup")
    ) {
      if (settings.pickup) {
        response = {
          allow: true,
          action: "pickup_flow",
          reply: "Sure, I can help with cheque/letter pickup. Please provide your ID number.",
        };
      } else {
        response = {
          allow: false,
          reply: "Cheque/Letter pickup service is currently disabled by admin.",
        };
      }
      return res.json(response);
    }

    // Check Speak to Human intent
    if (userMessage.includes("human")) {
      if (settings.speakToHuman) {
        response = {
          allow: true,
          action: "connect_human",
          reply: "Connecting you to a human representative now...",
        };
      } else {
        response = {
          allow: false,
          reply: "Human transfer is currently turned off by admin.",
        };
      }
      return res.json(response);
    }

    // Default response (no intent detected)
    return res.json(response);
  } catch (error) {
    console.error("Retell Webhook Error:", error);
    return res.status(500).json({ message: "Server error in Retell Webhook" });
  }
};

module.exports = { retellWebhook };