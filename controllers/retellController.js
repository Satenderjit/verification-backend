// controllers/retellController.js
const Settings = require("../models/Settings");
const retellClient = require("../config/retellClient");

// Retell AI webhook handler
const retellWebhook = async (req, res) => {
  try {
    console.log("Retell webhook received:", JSON.stringify(req.body, null, 2)); // Debug log

    // Load current toggle settings
    const settings = await Settings.findOne();

    // 💡 Fallback FIX: Handle missing settings document
    if (!settings) {
      return res.status(404).json({
        response: {
          allow: false,
          text: "System Error: Admin settings not initialized.",
        }
      });
    }

    // Handle different types of Retell webhook events
    const { event_type, transcript } = req.body;

    // For call established events (when call starts)
    if (event_type === "call_started") {
      // 🔑 FIX: Wrap response in the 'response' key for all events
      return res.json({
        response: {
          allow: true,
          text: "Hello! How can I assist you today?",
        }
      });
    }

    // For call ended events
    if (event_type === "call_ended") {
      return res.status(200).json({ received: true });
    }

    // For transcript updates (user spoke)
    if (event_type === "call_transcript" && transcript && transcript.length > 0) {
      const latestTranscript = transcript[transcript.length - 1];
      if (latestTranscript.role === "user") {
        const userMessage = latestTranscript.content.toLowerCase();

        let agentResponse = {}; // Use a temporary object

        // Check Appointment intent
        if (userMessage.includes("appointment")) {
          if (settings.appointment) {
            agentResponse = {
              allow: true,
              text: "Sure, I can help with the appointment. What date would you like?",
            };
          } else {
            // 🔑 FIX: allow: false ensures Retell uses the exact text and stops generative conversation
            agentResponse = {
              allow: false,
              text: "Sorry, appointment booking is currently disabled by admin.",
            };
          }
          return res.json({ response: agentResponse }); // Send wrapped response
        }

        // Check Cheque / Letter Pickup intent
        if (
          userMessage.includes("cheque") ||
          userMessage.includes("letter") ||
          userMessage.includes("pickup")
        ) {
          if (settings.pickup) {
            agentResponse = {
              allow: true,
              text: "Sure, I can help with cheque/letter pickup. Please provide your ID number.",
            };
          } else {
            agentResponse = {
              allow: false,
              text: "Cheque/Letter pickup service is currently disabled by admin.",
            };
          }
          return res.json({ response: agentResponse }); // Send wrapped response
        }

        // Check Speak to Human intent
        if (userMessage.includes("human")) {
          if (settings.speakToHuman) {
            agentResponse = {
              allow: true,
              text: "Connecting you to a human representative now...",
            };
          } else {
            agentResponse = {
              allow: false,
              text: "Human transfer is currently turned off by admin.",
            };
          }
          return res.json({ response: agentResponse }); // Send wrapped response
        }

        // Default response (no intent detected)
        return res.json({ 
          response: { // Send wrapped response
            allow: true,
            text: "How can I assist you today?",
          }
        });
      }
    }

    // Fallback for other types of events or if no user transcript is found
    return res.json({
      response: { // Send wrapped response
        allow: true,
        text: "I'm here to help. Could you please repeat that?",
      }
    });

  } catch (error) {
    console.error("Retell Webhook Error:", error);
    return res.status(500).json({ message: "Server error in Retell Webhook" });
  }
};

module.exports = { retellWebhook };