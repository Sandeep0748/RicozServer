// Create or promote an admin user.
// Usage:
//   node scripts/create-admin.js [email] [password] [name]
//   ADMIN_EMAIL=you@company.com ADMIN_PASSWORD=Secret123! ADMIN_NAME="Your Name" node scripts/create-admin.js
// Defaults come from .env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME).
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const email = (process.argv[2] || process.env.ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL || "admin@ricoz.local").toLowerCase();
const password = process.argv[3] || process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD || "Admin123!";
const name = process.argv[4] || process.env.ADMIN_NAME || process.env.SEED_ADMIN_NAME || "Ricoz Admin";

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set. Memory mode already has seed admin admin@ricoz.local / Admin123!.");
  process.exit(1);
}
if (password.length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
const passwordHash = await bcrypt.hash(password, 10);

let user = await User.findOne({ email });
if (user) {
  user.name = name;
  user.passwordHash = passwordHash;
  user.role = "admin";
  user.active = true;
  await user.save();
  console.log(`Admin updated: ${user.email} (id=${user._id})`);
} else {
  user = await User.create({ name, email, passwordHash, role: "admin", active: true });
  console.log(`Admin created: ${user.email} (id=${user._id})`);
}
await mongoose.disconnect();
process.exit(0);
