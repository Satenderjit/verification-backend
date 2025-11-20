const Settings = require("../models/Settings");

exports.handleRetellWebhook = async (req, res) => {
  try {
    // 1. Log Incoming Request (Debugging ke liye)
    console.log("🔵 Retell Request Received:", JSON.stringify(req.body.interaction_type));

    const { interaction_type, transcript, response_id } = req.body;

    // 2. Settings Fetch karein
    let settings = await Settings.findOne();
    
    // Agar settings nahi mili, toh default bana lo (Debug log ke sath)
    if (!settings) {
        console.log("⚠️ Warning: Database se settings nahi mili. Default use kar raha hun.");
        settings = { appointment: false, pickup: false, speakToHuman: false };
    } else {
        console.log("✅ Settings Loaded from DB:", JSON.stringify(settings));
    }

    // --- LOGIC: Response tayyar karna ---
    let responseText = "I am listening."; // Default fallback
    let shouldRespond = false;

    // CASE A: Call Start (Initial Greeting)
    // Retell 'call_update' bhejta hai jab call connect hoti hai (status: started)
    if (interaction_type === "call_update" && req.body.call?.status === "started") {
        shouldRespond = true;
        const { appointment, pickup, speakToHuman } = settings;

        // Logic to decide greeting
        if (!appointment && !pickup && !speakToHuman) {
            responseText = "Hello! All services are currently disabled by the admin.";
        } else if (!appointment && pickup && speakToHuman) {
            responseText = "Hello! Appointment booking is disabled, but I can help with pickup or transfer.";
        } else {
            // Normal Greeting
            responseText = "Hello! Verification Desk here. How can I assist you today?";
        }
    }

    // CASE B: User Spoke (Response Required)
    if (interaction_type === "response_required") {
        shouldRespond = true;
        
        // User ka last message nikalo
        const userMessage = transcript?.[transcript.length - 1]?.content?.toLowerCase() || "";
        console.log("🗣️ User Said:", userMessage);

        // --- DB Toggle Logic ---
        
        // 1. Appointment
        if (userMessage.includes("appointment") || userMessage.includes("book")) {
            if (!settings.appointment) {
                responseText = "I apologize, but appointment booking is currently turned off by the admin.";
            } else {
                responseText = "Sure, I can help you book an appointment. Please tell me your preferred date.";
            }
        }
        // 2. Pickup / Cheque
        else if (userMessage.includes("pick up") || userMessage.includes("pickup") || userMessage.includes("cheque")) {
            if (!settings.pickup) {
                responseText = "Sorry, the cheque pickup service is currently disabled.";
            } else {
                responseText = "Okay, I can arrange a pickup. What is your name?";
            }
        }
        // 3. Human / Agent
        else if (userMessage.includes("human") || userMessage.includes("agent") || userMessage.includes("talk to")) {
            if (!settings.speakToHuman) {
                responseText = "I am sorry, but connecting to a human agent is disabled right now.";
            } else {
                responseText = "Understood. Please hold while I connect you to a human representative.";
            }
        }
        // 4. Fallback (Agar kuch match na ho)
        else {
            responseText = "I understand. Could you please say that again or ask about appointments or pickups?";
        }
    }

    // 3. Response Bhejna (Agar zaroorat hai)
    if (shouldRespond) {
        const payload = {
            response_id: response_id, // 🔥 CRITICAL: Ye ID match honi chahiye
            content: responseText,
            content_complete: true,
            end_call: false
        };
        
        console.log("🟢 Sending Response to Retell:", JSON.stringify(payload));
        return res.json(payload);
    }

    // Agar sirf update tha (e.g. user chup hai), toh 200 OK bhej do
    return res.status(200).json({ message: "Received" });

  } catch (error) {
    console.error("❌ Webhook Error:", error);
    // Crash hone par bhi valid JSON bhejo taaki call na kate
    return res.status(500).json({
        response_id: req.body.response_id,
        content: "System error. Please try again later.",
        content_complete: true
    });
  }
};