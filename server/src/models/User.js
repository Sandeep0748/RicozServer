import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "agent", "customer"], default: "agent" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.toJSONSafe = function () {
  return { id: String(this._id), name: this.name, email: this.email, role: this.role, active: this.active };
};

export default mongoose.models.User || mongoose.model("User", userSchema);
