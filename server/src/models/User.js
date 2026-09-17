import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "agent", "customer"], default: "agent" },
    active: { type: Boolean, default: true },
    // Workspace this user belongs to. Email is unique *per workspace*,
    // so the same person can exist in two orgs (compound index below).
    // Optional only for backward compatibility — every new user gets one,
    // and seed.js backfills legacy docs into the default org.
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    // Bumped by "Log out everywhere" — tokens carrying an older version stop working.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ orgId: 1, email: 1 }, { unique: true });

userSchema.methods.toJSONSafe = function () {
  return { id: String(this._id), name: this.name, email: this.email, role: this.role, active: this.active, orgId: this.orgId ? String(this.orgId) : null };
};

export default mongoose.models.User || mongoose.model("User", userSchema);
