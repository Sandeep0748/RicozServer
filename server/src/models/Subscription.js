import mongoose from "mongoose";

// Billing state per workspace. Razorpay ids stay empty until Phase 2 wires payments;
// plan/cycle/status already drive entitlements today.
const invoiceSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "" },
    url: { type: String, default: "" },
    at: { type: Date },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, unique: true, index: true },
    plan: { type: String, enum: ["free", "pro", "scale"], default: "free" },
    cycle: { type: String, enum: ["monthly", "annual"], default: "monthly" },
    status: { type: String, enum: ["trialing", "active", "past_due", "cancelled"], default: "trialing" },
    razorpayCustomerId: { type: String, default: "" },
    razorpaySubscriptionId: { type: String, default: "" },
    currentPeriodEnd: { type: Date },
    invoices: { type: [invoiceSchema], default: [] },
  },
  { timestamps: true }
);

subscriptionSchema.methods.toJSONSafe = function () {
  return {
    id: String(this._id),
    orgId: String(this.orgId),
    plan: this.plan,
    cycle: this.cycle,
    status: this.status,
    currentPeriodEnd: this.currentPeriodEnd,
    invoices: this.invoices || [],
    // Payment provider wiring lands in Phase 2; never expose provider ids to the client.
  };
};

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
