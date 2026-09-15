import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ["customer", "agent", "internal", "system"], default: "agent" },
    author: { type: String, default: "" },
    text: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, index: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    company: { type: String, default: "" },
    channel: {
      type: String,
      enum: ["Email", "Chat", "Voice", "WhatsApp", "Social", "Instagram", "Portal"],
      default: "Email",
    },
    priority: { type: String, enum: ["Urgent", "High", "Medium", "Low"], default: "Medium" },
    status: { type: String, enum: ["Open", "Pending", "Resolved", "Closed"], default: "Open" },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    agentName: { type: String, default: "Unassigned" },
    slaDueAt: { type: Date },
    sentiment: { type: String, enum: ["Positive", "Neutral", "Negative"], default: "Neutral" },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
