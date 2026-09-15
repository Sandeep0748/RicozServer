import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    company: { type: String, default: "" },
    phone: { type: String, default: "" },
    health: { type: String, enum: ["Healthy", "At risk", "Champion"], default: "Healthy" },
    csat: { type: Number, default: 4.2, min: 1, max: 5 },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);
