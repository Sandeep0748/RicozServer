import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, default: "" },
    category: { type: String, default: "General" },
    views: { type: Number, default: 0 },
    helpfulYes: { type: Number, default: 0 },
    helpfulNo: { type: Number, default: 0 },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
  },
  { timestamps: true }
);

articleSchema.index({ orgId: 1, category: 1 });
articleSchema.index({ orgId: 1, updatedAt: -1 });

export default mongoose.models.Article || mongoose.model("Article", articleSchema);
