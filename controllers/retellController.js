const Settings = require("../models/Settings");

exports.handleRetellWebhook = async (req, res) => {
  try {
    console.log("\n🔹 Retell Request Received 🔹");
    
    const { interaction_type, transcript, response_id } = req.body;

    // 1. Database se latest Settings/Toggles fetch karein
    let settings = await Settings.findOne();
    
    // Agar settings nahi mili, to default values
    const config = settings || { appointment: false, pickup: false, speakToHuman: false };
    
    console.log(`👉 DB Config -> Appointment: ${config.appointment}, Pickup: ${config.pickup}, Human: ${config.speakToHuman}`);

    // ============================================================
    // STEP 1: INITIAL GREETING (Jab Call Connect hoti hai)
    // ============================================================
    // Logic: Agar transcript khali hai, iska matlab call abhi shuru hui hai -> Hum Hello bolenge.
    if (!transcript || transcript.length === 0 || interaction_type === "call_update") {
        
        console.log("🎤 Sending Initial Greeting...");

        let greeting = "Hello! How can I assist you today?";

        // Agar Appointment ON hai, to greeting mein mention karein
        if (config.appointment && !config.pickup) {
            greeting = "Hello! I can help you book an appointment. How can I assist you?";
        }
        // Agar saare toggles OFF hain
        else if (!config.appointment && !config.pickup && !config.speakToHuman) {
            greeting = "Hello! Please note that all our automated services are currently unavailable.";
        }

        return res.json({
            response_id: response_id,
            content: greeting,
            content_complete: true,
            end_call: false
        });
    }

    // ============================================================
    // STEP 2: USER REPLY HANDLING (Jab User kuch bolta hai)
    // ============================================================
    if (interaction_type === "response_required" && transcript.length > 0) {
        
        const lastUserMessage = transcript[transcript.length - 1].content.toLowerCase();
        console.log(`🗣️ User Said: "${lastUserMessage}"`);

        let responseText = "I'm sorry, I didn't quite catch that.";

        // --- LOGIC START: Check Toggles ---

        // 1. APPOINTMENT (User asks to book)
        if (lastUserMessage.includes("appointment") || lastUserMessage.includes("book") || lastUserMessage.includes("schedule")) {
            if (config.appointment) { // Toggle ON (Green)
                responseText = "Sure! I can definitely help you book an appointment. What date works for you?";
            } else { // Toggle OFF (Grey)
                responseText = "I apologize, but we are not accepting appointment bookings at this time.";
            }
        }

        // 2. PICKUP CHECK (User asks for pickup)
        else if (lastUserMessage.includes("pickup") || lastUserMessage.includes("check") || lastUserMessage.includes("cheque")) {
            if (config.pickup) { // Toggle ON
                responseText = "Okay, I can arrange a cheque pickup. Could you verify your address?";
            } else { // Toggle OFF (Grey - Jaise aapke screenshot mein hai)
                responseText = "I'm sorry, but the cheque pickup service is currently disabled.";
            }
        }

        // 3. SPEAK TO HUMAN (User asks for agent)
        else if (lastUserMessage.includes("human") || lastUserMessage.includes("agent") || lastUserMessage.includes("person")) {
            if (config.speakToHuman) { // Toggle ON
                responseText = "Understood. Please hold the line while I connect you to a human agent.";
            } else { // Toggle OFF
                responseText = "I apologize, but there are no human agents available right now.";
            }
        }

        // 4. GREETING REPLY (User says Hello back)
        else if (lastUserMessage.includes("hello") || lastUserMessage.includes("hi")) {
             responseText = "Hello there! Would you like to book an appointment or enquire about a pickup?";
        }
        
        // 5. UNKNOWN REQUEST
        else {
            responseText = "I can help with appointments and pickups. Which one do you need?";
        }

        console.log(`🤖 AI Will Say: "${responseText}"`);

        // Send Response back to Retell
        return res.json({
            response_id: response_id,
            content: responseText,
            content_complete: true,
            end_call: false
        });
    }

    // Fallback for other events (Ping/Pong etc)
    return res.status(200).json({ message: "Event received" });

  } catch (error) {
    console.error("❌ Server Error:", error);
    // Agar error aaye tab bhi kuch return karein taaki call drop na ho
    return res.status(500).json({ 
        content: "I am having some trouble connecting. Please try again.",
        content_complete: true 
    });
  }
};