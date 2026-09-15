import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, default: "" },
    category: { type: String, default: "General" },
    views: { type: Number, default: 0 },
    helpfulYes: { type: Number, default: 0 },
    helpfulNo: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Article || mongoose.model("Article", articleSchema);
