const Settings = require("../models/Settings");

exports.handleRetellWebhook = async (req, res) => {
  try {
    // 1. Log Incoming Request (Debugging ke liye zaroori hai)
    console.log("🔵 Retell Event Received:", req.body.interaction_type);

    const { interaction_type, response_id, transcript } = req.body;

    // 2. Database se settings fetch karein
    let settings = await Settings.findOne();
    
    // Agar DB naya hai aur settings nahi mili, toh default banayein
    if (!settings) {
        settings = { appointment: false, pickup: false, speakToHuman: false };
        console.log("⚠️ Settings not found, using defaults (All False)");
    } else {
        console.log("✅ Settings Loaded:", JSON.stringify(settings));
    }

    // ======================================================
    // CASE 1: Call Start (Bot Sabse Pehle Bolega)
    // ======================================================
    // Retell 'call_update' bhejta hai jab call connect hoti hai
    if (interaction_type === "call_update" && req.body.call?.status === "started") {
        console.log("📞 Call Started. Sending Greeting...");
        return res.json({
            response_id: response_id,
            content: "Hello! Verification Desk here. How can I help you today?",
            content_complete: true,
            end_call: false
        });
    }

    // ======================================================
    // CASE 2: User ne kuch bola (Response Required)
    // ======================================================
    if (interaction_type === "response_required") {
        
        const userMessage = transcript?.[transcript.length - 1]?.content?.toLowerCase() || "";
        console.log("🗣️ User Said:", userMessage);

        let aiResponse = "I am sorry, I didn't quite catch that.";

        // --- LOGIC: Check Buttons (ON / OFF) ---

        // 1. Appointment Logic
        if (userMessage.includes("appointment") || userMessage.includes("book") || userMessage.includes("schedule")) {
            if (settings.appointment === true) {
                aiResponse = "Sure! I can help you book an appointment. Please provide your preferred date.";
            } else {
                aiResponse = "I apologize, but appointment booking is currently disabled by the administrator.";
            }
        }
        
        // 2. Pickup / Cheque Logic
        else if (userMessage.includes("pick up") || userMessage.includes("pickup") || userMessage.includes("check") || userMessage.includes("cheque")) {
            if (settings.pickup === true) {
                aiResponse = "Okay, I can assist with the cheque pickup. May I have your name?";
            } else {
                aiResponse = "I apologize, but the cheque pickup service is currently unavailable.";
            }
        }

        // 3. Human Transfer Logic
        else if (userMessage.includes("human") || userMessage.includes("agent") || userMessage.includes("representative")) {
            if (settings.speakToHuman === true) {
                aiResponse = "Understood. Please hold while I verify availability and transfer you.";
            } else {
                aiResponse = "I am sorry, but connecting to a human agent is not possible at this moment.";
            }
        }

        // 4. General Fallback (Agar user ne bas 'Hello' bola ho)
        else if (userMessage.includes("hello") || userMessage.includes("hi")) {
             aiResponse = "Hello! I can help with appointments, cheque pickups, or connecting to an agent. What do you need?";
        }
        
        // 5. Agar kuch aur bola jo samajh nahi aaya
        else {
            aiResponse = "I can mostly help with appointments and pickups. Could you please clarify?";
        }

        // FINAL RESPONSE SENDING
        const payload = {
            response_id: response_id,
            content: aiResponse,
            content_complete: true,
            end_call: false
        };
        
        console.log("🟢 Sending Response:", JSON.stringify(payload));
        return res.json(payload);
    }

    // Agar koi aur event hai (e.g. update_only), toh bas OK bhejo
    return res.status(200).json({ message: "Event received" });

  } catch (error) {
    console.error("❌ Webhook Error:", error);
    // Error hone par bhi valid JSON bhejo taaki call drop na ho
    return res.status(500).json({
        content: "I am having trouble connecting to the system. Please try again later.",
        content_complete: true
    });
  }
};