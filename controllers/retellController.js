// controllers/retellController.js
const Settings = require("../models/Settings");
const retellClient = require("../config/retellClient");

// Retell AI webhook handler
const retellWebhook = async (req, res) => {
  try {
    console.log("Retell webhook received:", JSON.stringify(req.body, null, 2)); // Debug log

    // Load current toggle settings
    const settings = await Settings.findOne();

    // 💡 FIX 1: Prevent crash if the database connection failed or settings document is missing/not created.
    if (!settings) {
      return res.status(404).json({
        message: "Settings document not found in DB. Please use the Admin Dashboard to initialize.",
        allow: false,
      });
    }

    // Handle different types of Retell webhook events
    const { event_type, call_id, transcript, metadata } = req.body;

    // For call established events (when call starts)
    if (event_type === "call_started") {
      return res.json({
        allow: true,
        text: "Hello! How can I assist you today?",
      });
    }

    // For call ended events
    if (event_type === "call_ended") {
      return res.status(200).json({ received: true });
    }

    // For transcript updates (user spoke)
    if (event_type === "call_transcript" && transcript && transcript.length > 0) {
      // Get the latest transcript from the user
      const latestTranscript = transcript[transcript.length - 1];
      if (latestTranscript.role === "user") {
        const userMessage = latestTranscript.content.toLowerCase();

        // Initialize response
        let response = {
          allow: true,
          text: "How can I assist you today?",
        };

        // Check Appointment intent
        if (userMessage.includes("appointment")) {
          if (settings.appointment) {
            response = {
              allow: true,
              text: "Sure, I can help with the appointment. What date would you like?",
            };
          } else {
            response = {
              allow: false,
              text: "Sorry, appointment booking is currently disabled by admin.",
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
              text: "Sure, I can help with cheque/letter pickup. Please provide your ID number.",
            };
          } else {
            response = {
              allow: false,
              text: "Cheque/Letter pickup service is currently disabled by admin.",
            };
          }
          return res.json(response);
        }

        // Check Speak to Human intent
        if (userMessage.includes("human")) {
          if (settings.speakToHuman) {
            response = {
              allow: true,
              text: "Connecting you to a human representative now...",
            };
          } else {
            response = {
              allow: false,
              text: "Human transfer is currently turned off by admin.",
            };
          }
          return res.json(response);
        }

        // Default response (no intent detected)
        return res.json(response);
      }
    }

    // Fallback for other types of events or if no user transcript is found
    return res.json({
      allow: true,
      text: "I'm here to help. Could you please repeat that?",
    });

  } catch (error) {
    console.error("Retell Webhook Error:", error);
    return res.status(500).json({ message: "Server error in Retell Webhook" });
  }
};

module.exports = { retellWebhook };