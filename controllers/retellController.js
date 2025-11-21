// controllers/retellController.js
const Settings = require("../models/Settings");

exports.handleRetellWebhook = async (req, res) => {
  try {
    // 1. Debugging ke liye Log print karein (Render Dashboard mein dikhega)
    console.log("--------------------------------------------------");
    console.log("Retell Webhook Received");
    // console.log("Body:", JSON.stringify(req.body, null, 2)); // Uncomment for full details

    const { interaction_type, transcript, response_id, call } = req.body;

    // 2. Database se Toggles (Settings) fetch karein
    let settings = await Settings.findOne();
    
    // Agar settings DB mein nahi bani hain, to default false maan lein
    const config = settings || { appointment: false, pickup: false, speakToHuman: false };
    console.log("Current DB Config:", config);

    // ======================================================
    // SCENARIO A: CALL START / INITIAL GREETING
    // ======================================================
    // Retell "call_update" bhejta hai jab call register hoti hai.
    // Ya kabhi kabhi pehli request mein transcript empty hoti hai.
    if (
        interaction_type === "ping_pong" || // Retell URL verify karne ke liye bhejta hai
        (interaction_type === "call_update" && call && call.status === "registered") ||
        (interaction_type === "response_required" && (!transcript || transcript.length === 0))
    ) {
        console.log(">> Sending Initial Greeting...");

        let greeting = "Hello! Thanks for calling. How can I assist you today?";

        // Agar saare features disabled hain, to greeting change karein
        if (!config.appointment && !config.pickup && !config.speakToHuman) {
            greeting = "Hello! Currently, all our automated services are offline. Please try again later.";
        }

        return res.json({
            response_id: response_id,
            content: greeting,
            content_complete: true,
            end_call: false
        });
    }

    // ======================================================
    // SCENARIO B: USER SPOKE (RESPONSE REQUIRED)
    // ======================================================
    if (interaction_type === "response_required" && transcript && transcript.length > 0) {
        
        // User ki last kahi hui baat nikalein
        const lastUserMessageObj = transcript[transcript.length - 1];
        const userMessage = lastUserMessageObj.content.toLowerCase(); // Small letters for easy matching
        
        console.log(`>> User Said: "${userMessage}"`);

        let responseText = "I understand. Could you please provide more details?";

        // --- LOGIC START ---

        // 1. Appointment Booking
        if (userMessage.includes("appointment") || userMessage.includes("book") || userMessage.includes("schedule")) {
            if (config.appointment) {
                responseText = "Sure, I can help you book an appointment. What date and time works best for you?";
            } else {
                responseText = "I apologize, but appointment booking is currently disabled by the administrator.";
            }
        }

        // 2. Cheque Pickup
        else if (userMessage.includes("pickup") || userMessage.includes("pick up") || userMessage.includes("cheque") || userMessage.includes("check")) {
            if (config.pickup) {
                responseText = "I can certainly help with the cheque pickup. Could you please tell me your location?";
            } else {
                responseText = "I am sorry, but the cheque verification and pickup service is currently unavailable.";
            }
        }

        // 3. Speak to Human / Agent
        else if (userMessage.includes("human") || userMessage.includes("agent") || userMessage.includes("representative") || userMessage.includes("person")) {
            if (config.speakToHuman) {
                responseText = "Understood. Please hold the line while I transfer you to a human representative.";
                // Future Update: Yahan aap 'transfer_call' tool bhi add kar sakte hain
            } else {
                responseText = "I apologize, but no human representatives are available at the moment to take your call.";
            }
        }

        // 4. General / Context Maintain (Basic Fallback)
        else {
            // Agar user ne kuch aisa bola jo upar match nahi hua, to generic reply
            responseText = "Could you please clarify if you need help with an appointment, a cheque pickup, or speaking to an agent?";
        }

        // --- LOGIC END ---

        console.log(`>> AI Replying: "${responseText}"`);

        return res.json({
            response_id: response_id,
            content: responseText,
            content_complete: true,
            end_call: false
        });
    }

    // Agar koi aur event aaye (jaise call_ended), to bas 200 OK bhejein
    return res.status(200).json({ message: "Event acknowledged" });

  } catch (error) {
    console.error("!! Controller Error:", error);
    // Retell ko error response bhejein taaki call drop na ho, bas AI bole ki issue hai
    return res.status(500).json({
        content: "I am experiencing a technical issue connecting to the database. Please try again later.",
        content_complete: true,
        end_call: true
    });
  }
};