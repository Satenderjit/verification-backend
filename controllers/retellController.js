const Settings = require("../models/Settings");

exports.handleRetellWebhook = async (req, res) => {
  try {
    const { interaction_type, response_id, transcript } = req.body;

    // 1. Database se Button ki status check karein (ON/OFF)
    let settings = await Settings.findOne();
    
    // Agar settings nahi mili (first time), toh sab false maano
    if (!settings) {
        settings = { appointment: false, pickup: false, speakToHuman: false };
    }

    console.log("🔘 Current Button Status:", JSON.stringify(settings));

    // ==========================================
    // CASE 1: Call Start (Greeting)
    // ==========================================
    if (interaction_type === "call_update" && req.body.call?.status === "started") {
        // Initial greeting
        return res.json({
            response_id: response_id,
            content: "Hello! Welcome to Paradise Smiles. How can I help you today?",
            content_complete: true,
            end_call: false
        });
    }

    // ==========================================
    // CASE 2: User kuch bole (Logic Check)
    // ==========================================
    if (interaction_type === "response_required") {
        
        // User ki last kahi hui baat
        const userMessage = transcript?.[transcript.length - 1]?.content?.toLowerCase() || "";
        console.log("🗣️ User asked:", userMessage);

        let aiResponse = "I can help with appointments, cheque pickup, or connecting you to a human.";

        // --- LOGIC: Button Status Check ---

        // 1. Agar user "Appointment" maange
        if (userMessage.includes("appointment") || userMessage.includes("book") || userMessage.includes("schedule")) {
            if (settings.appointment === true) {
                // BUTTON IS ON
                aiResponse = "Sure! I can help you book an appointment. What date works for you?";
            } else {
                // BUTTON IS OFF
                aiResponse = "I apologize, but appointment booking is currently disabled based on our current settings.";
            }
        }

        // 2. Agar user "Pickup / Check" maange
        else if (userMessage.includes("pick up") || userMessage.includes("check") || userMessage.includes("cheque")) {
            if (settings.pickup === true) {
                // BUTTON IS ON
                aiResponse = "Yes, you can come for the pickup. May I have your name?";
            } else {
                // BUTTON IS OFF
                aiResponse = "Sorry, the cheque pickup service is currently unavailable.";
            }
        }

        // 3. Agar user "Human / Agent" maange
        else if (userMessage.includes("human") || userMessage.includes("person") || userMessage.includes("agent")) {
            if (settings.speakToHuman === true) {
                // BUTTON IS ON
                aiResponse = "Understood. Please hold while I transfer you to a representative.";
                // Note: Transfer logic Retell ke 'transfer_call' tool se hoti hai, abhi hum sirf bol rahe hain.
            } else {
                // BUTTON IS OFF
                aiResponse = "I apologize, but no human agents are available at the moment.";
            }
        }

        // Response bhejo Retell ko
        return res.json({
            response_id: response_id,
            content: aiResponse,
            content_complete: true,
            end_call: false
        });
    }

    // Default acknowledgement for other events
    return res.status(200).json({ message: "Event received" });

  } catch (error) {
    console.error("❌ Error in Retell Controller:", error);
    return res.status(500).json({ error: "Server error" });
  }
};