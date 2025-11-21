import mongoose from "mongoose";

const chequeSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, required: true },
    chequeNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    verified: { type: Boolean, default: false },
    notes: { type: String }, // optional remarks from bot or workflow
  },
  { timestamps: true }
);

export default mongoose.model("Cheque", chequeSchema);
