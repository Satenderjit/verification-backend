const Settings = require("../models/Settings");

exports.handleRetellWebhook = async (req, res) => {
  try {
    const { event, transition_name } = req.body;

    // 1. Ignore non-transition events (like ping or call_started)
    if (event !== "transition_triggered") {
      return res.status(200).json({ message: "Event received" });
    }

    console.log(`🔹 Transition Requested: "${transition_name}"`);

    // 2. Get Toggles from DB
    let settings = await Settings.findOne();
    if (!settings) {
      // Default to enabled if no DB entry exists yet
      settings = { appointment: true, pickup: true, speakToHuman: true };
    }

    // 3. CHECK LOGIC (Exact names from your Retell screenshot)

    // --- A. APPOINTMENT ---
    if (transition_name === "User want to booked an appointment") {
      if (!settings.appointment) {
        console.log("⛔ Blocking Appointment");
        return res.json({
          override: {
            response: "I apologize, but our appointment booking system is currently unavailable. Is there anything else I can help with?"
          }
        });
      }
    }

    // --- B. CHEQUE PICKUP ---
    if (transition_name === "User want to pick up a cheque or letter") {
      if (!settings.pickup) {
        console.log("⛔ Blocking Pickup");
        return res.json({
          override: {
            response: "Sorry, cheque pickups are currently disabled. Please contact our office directly for assistance."
          }
        });
      }
    }

    // --- C. SPEAK TO HUMAN ---
    if (transition_name === "user ask to speak to a human") {
      if (!settings.speakToHuman) {
        console.log("⛔ Blocking Human Transfer");
        return res.json({
          override: {
            response: "All our human agents are currently busy or unavailable. Please try again later."
          }
        });
      }
    }

    // 4. If not blocked, ALLOW the workflow to proceed
    console.log("✅ Allowing Transition");
    return res.json({ allow: true });

  } catch (error) {
    console.error("❌ Webhook Error:", error);
    // Fail-safe: Allow workflow to continue so the call doesn't hang
    return res.json({ allow: true });
  }
};