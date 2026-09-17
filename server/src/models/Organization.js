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
    // Workspace preferences (Settings tabs). Defaults are applied at read
    // time (see utils/settings.js), so older orgs need no migration.
    settings: {
      business: {
        name: { type: String, default: "" },
        logoUrl: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        website: { type: String, default: "" },
        businessType: { type: String, default: "" },
        gstin: { type: String, default: "" },
        pan: { type: String, default: "" },
        currency: { type: String, default: "INR" },
        timezone: { type: String, default: "UTC" },
        dateFormat: { type: String, default: "DD-MM-YYYY" },
      },
      invoice: {
        currency: { type: String, default: "INR" },
        paymentTerms: { type: String, default: "Net 30" },
        prefix: { type: String, default: "INV" },
        startNumber: { type: Number, default: 1, min: 1 },
        defaultTax: { type: Number, default: 18, min: 0, max: 100 },
        notes: { type: String, default: "" },
        terms: { type: String, default: "" },
      },
      taxes: { type: [{ name: String, rate: Number }], default: [{ name: "GST", rate: 18 }] },
      paymentMethods: { type: [String], default: ["UPI", "Card", "Netbanking", "Cash"] },
      notifications: {
        invoiceSent: { type: Boolean, default: true },
        paymentReceived: { type: Boolean, default: true },
        invoiceOverdue: { type: Boolean, default: true },
        teamActivity: { type: Boolean, default: true },
      },
    },
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
