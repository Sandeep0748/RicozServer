import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  seq: { type: Number, default: 1042 },
});

export async function nextTicketId() {
  const doc = await mongoose.models.Counter.findOneAndUpdate(
    { key: "ticket" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `RC-${doc.seq}`;
}

export default mongoose.models.Counter || mongoose.model("Counter", counterSchema);
