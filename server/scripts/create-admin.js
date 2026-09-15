// Create or promote an admin user inside a workspace.
// Usage:
//   node scripts/create-admin.js [email] [password] [name] [orgSlug]
//   ADMIN_EMAIL=you@company.com ADMIN_PASSWORD=Secret123! ORG_SLUG=my-workspace node scripts/create-admin.js
// Defaults come from .env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME / SEED_ORG_SLUG).
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Organization from "../src/models/Organization.js";

const email = (process.argv[2] || process.env.ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL || "admin@ricoz.local").toLowerCase();
const password = process.argv[3] || process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD || "Admin123!";
const name = process.argv[4] || process.env.ADMIN_NAME || process.env.SEED_ADMIN_NAME || "Ricoz Admin";
const orgSlug = (process.argv[5] || process.env.ORG_SLUG || process.env.SEED_ORG_SLUG || "ricoz-demo").toLowerCase();

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set. Memory mode already has seed admin admin@ricoz.local / Admin123!.");
  process.exit(1);
}
if (password.length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const org = await Organization.findOne({ slug: orgSlug });
if (!org) {
  console.error(`Workspace not found: ${orgSlug}. Run 'npm run seed' first or pass an existing slug.`);
  await mongoose.disconnect();
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);

let user = await User.findOne({ email, orgId: org._id });
if (user) {
  user.name = name;
  user.passwordHash = passwordHash;
  user.role = "admin";
  user.active = true;
  await user.save();
  console.log(`Admin updated: ${user.email} in workspace ${org.slug} (id=${user._id})`);
} else {
  user = await User.create({ name, email, passwordHash, role: "admin", active: true, orgId: org._id });
  console.log(`Admin created: ${user.email} in workspace ${org.slug} (id=${user._id})`);
}
await mongoose.disconnect();
process.exit(0);
