// controllers/retellController.js
// Complete file with dynamic greeting logic and transcript handling

const Settings = require("../models/Settings");

exports.handleRetellWebhook = async (req, res) => {
  try {
    const { event_type, transcripts, call } = req.body;

    // Fetch current settings from DB
    const settings = await Settings.findOne();
    if (!settings) {
      return res.json({
        allow: false,
        text: "Configuration error: settings not found.",
      });
    }

    // ================================
    //  CALL STARTED — DYNAMIC GREETING
    // ================================

    if (event_type === "call_started") {
      let greeting = "Hello! How can I assist you today?";

      const { appointment, pickup, speakToHuman } = settings;

      if (!appointment && !pickup && !speakToHuman) {
        greeting = "Hello! All services are currently disabled by admin.";
      } else if (!appointment && pickup && speakToHuman) {
        greeting = "Hello! Appointment booking is disabled at the moment. How can I help you?";
      } else if (appointment && !pickup && speakToHuman) {
        greeting = "Hello! Cheque/letter pickup service is currently disabled. How can I help you?";
      } else if (appointment && pickup && !speakToHuman) {
        greeting = "Hello! Human transfer is currently turned off. How can I help you?";
      } else if (!appointment && !pickup && speakToHuman) {
        greeting = "Hello! Appointment and pickup services are disabled. How can I help you?";
      } else if (!appointment && pickup && !speakToHuman) {
        greeting = "Hello! Appointment and human transfer are disabled. How can I help you?";
      } else if (appointment && !pickup && !speakToHuman) {
        greeting = "Hello! Pickup and human transfer are disabled. How can I help you?";
      }

      return res.json({ allow: true, text: greeting });
    }

    // ================================
    //  CALL TRANSCRIPT HANDLING
    // ================================

    if (event_type === "call_transcript") {
      const lastMessage = transcripts?.[transcripts.length - 1]?.content;
      if (!lastMessage) {
        return res.json({ allow: true, text: "Could you please repeat that?" });
      }

      // Lowercase for matching
      const msg = lastMessage.toLowerCase();

      // Appointment-related responses
      if (msg.includes("appointment")) {
        if (!settings.appointment) {
          return res.json({ allow: true, text: "Appointment booking is currently disabled by admin." });
        }
        return res.json({ allow: true, text: "Sure! I can help you book an appointment. Please provide your name and preferred date." });
      }

      // Pickup-related responses
      if (msg.includes("pick up") || msg.includes("pickup") || msg.includes("cheque")) {
        if (!settings.pickup) {
          return res.json({ allow: true, text: "Cheque/letter pickup service is currently disabled by admin." });
        }
        return res.json({ allow: true, text: "Sure! I can help you with cheque/letter pickup. May I have your name?" });
      }

      // Human-transfer related responses
      if (msg.includes("human") || msg.includes("staff") || msg.includes("agent")) {
        if (!settings.speakToHuman) {
          return res.json({ allow: true, text: "Human transfer is currently disabled by admin." });
        }
        return res.json({ allow: true, text: "Transferring you to a human representative now." });
      }

      // Default fallback
      return res.json({ allow: true, text: "I understand. Could you please explain more?" });
    }

    // ================================
    //  CALL ENDED
    // ================================

    if (event_type === "call_ended") {
      return res.json({ success: true });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ allow: false, text: "Server error in webhook handler." });
  }
};