import mongoose from "mongoose";

// A workspace (tenant). Every user, ticket, customer and article belongs to one org.
const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    plan: { type: String, enum: ["free", "pro", "scale"], default: "free" },
    planCycle: { type: String, enum: ["monthly", "annual"], default: "monthly" },
    // trialing = inside 14-day Pro trial · active = paying/free in good standing ·
    // past_due = payment failed (grace) · suspended = blocked
    status: { type: String, enum: ["trialing", "active", "past_due", "suspended"], default: "trialing" },
    trialEndsAt: { type: Date },
    // Max agents in this workspace. Trials unlock Pro *features* but not extra seats.
    seats: { type: Number, default: 2, min: 1 },
    billingCustomerId: { type: String, default: "" }, // Razorpay customer id (Phase 2)
  },
  { timestamps: true }
);

organizationSchema.methods.toJSONSafe = function () {
  return {
    id: String(this._id),
    name: this.name,
    slug: this.slug,
    plan: this.plan,
    planCycle: this.planCycle,
    status: this.status,
    trialEndsAt: this.trialEndsAt,
    seats: this.seats,
  };
};

export default mongoose.models.Organization || mongoose.model("Organization", organizationSchema);
