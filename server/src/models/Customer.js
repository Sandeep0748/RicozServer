import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    company: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    gstin: { type: String, default: "" },
    contactPerson: { type: String, default: "" },
    health: { type: String, enum: ["Healthy", "At risk", "Champion"], default: "Healthy" },
    csat: { type: Number, default: 4.2, min: 1, max: 5 },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
  },
  { timestamps: true }
);

customerSchema.index({ orgId: 1, name: 1 });
customerSchema.index({ orgId: 1, email: 1 });

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);
