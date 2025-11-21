const Settings = require("../models/Settings");

exports.handleRetellWebhook = async (req, res) => {
  try {
    // Log to see if Retell is hitting your server
    console.log("Retell Webhook Hit:", JSON.stringify(req.body, null, 2));

    // Retell Custom LLM sends 'interaction_type'
    // Usually: "update_only" (server listens) or "response_required" (server must speak)
    const { interaction_type, transcript, response_id } = req.body;

    // Fetch settings from DB
    const settings = await Settings.findOne();
    
    // Default settings if missing
    const config = settings || { appointment: false, pickup: false, speakToHuman: false };

    // ======================================================
    // 1. CALL STARTED (Initial Greeting)
    // ======================================================
    // Retell might send interaction_type: "call_update" with status "started" or empty transcript initially
    if (interaction_type === "call_update" && (!transcript || transcript.length === 0)) {
        let greeting = "Hello! How can I assist you today?";
        
        const { appointment, pickup, speakToHuman } = config;
        
        if (!appointment && !pickup && !speakToHuman) {
            greeting = "Hello! All services are currently disabled by admin.";
        } 
        // (Logic same as your code for greetings...)
        
        return res.json({
            response_id: response_id,
            content: greeting,
            content_complete: true,
            end_call: false
        });
    }

    // ======================================================
    // 2. RESPONSE REQUIRED (User spoke, Agent needs to reply)
    // ======================================================
    if (interaction_type === "response_required") {
        // Get the last user message
        const userMessage = transcript[transcript.length - 1]?.content?.toLowerCase() || "";
        
        let responseText = "I understand. Could you please explain more?";

        // --- Logic based on DB Toggles ---

        // Appointment Logic
        if (userMessage.includes("appointment") || userMessage.includes("book")) {
            if (!config.appointment) {
                responseText = "I apologize, but appointment booking is currently disabled by the administrator.";
            } else {
                responseText = "Sure! I can help you book an appointment. Please provide your name and preferred date.";
            }
        }
        // Pickup Logic
        else if (userMessage.includes("pick up") || userMessage.includes("pickup") || userMessage.includes("cheque")) {
            if (!config.pickup) {
                responseText = "I apologize, but the cheque pickup service is currently disabled.";
            } else {
                responseText = "Sure! I can help you with the cheque pickup. May I have your name?";
            }
        }
        // Human Transfer Logic
        else if (userMessage.includes("human") || userMessage.includes("agent") || userMessage.includes("staff")) {
            if (!config.speakToHuman) {
                responseText = "I apologize, but transfer to a human representative is currently unavailable.";
            } else {
                responseText = "Understood. I am transferring you to a human representative now. Please hold.";
                // Optional: Add logic here to actually transfer call if Retell supports it via JSON
            }
        }

        // Return the response to Retell
        return res.json({
            response_id: response_id,
            content: responseText,
            content_complete: true,
            end_call: false
        });
    }

    // Default fallback for other events (like update_only)
    return res.status(200).json({ message: "Event received" });

  } catch (error) {
    console.error("Webhook Error:", error);
    // Even in error, try to return something valid so call doesn't drop
    return res.status(500).json({ 
        content: "I am having trouble connecting to the server. Please try again later.",
        content_complete: true 
    });
  }
};