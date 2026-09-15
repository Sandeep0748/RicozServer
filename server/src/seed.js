import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDb, isDbConnected } from "./config/db.js";
import User from "./models/User.js";
import Customer from "./models/Customer.js";
import Ticket from "./models/Ticket.js";
import Article from "./models/Article.js";
import Counter from "./models/Counter.js";
import Organization from "./models/Organization.js";
import Subscription from "./models/Subscription.js";
import { slaDueAt } from "./utils/sla.js";
import { memory } from "./store/memoryStore.js";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@ricoz.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
const ORG_NAME = process.env.SEED_ORG_NAME || "Ricoz Demo";
const ORG_SLUG = (process.env.SEED_ORG_SLUG || "ricoz-demo").toLowerCase();

async function dropIndexIfExists(model, name) {
  try {
    await model.collection.dropIndex(name);
    console.log(`Dropped legacy index ${name}`);
  } catch {
    // absent — nothing to do
  }
}

async function run() {
  await connectDb(process.env.MONGO_URI);
  if (!isDbConnected()) {
    console.log("Seed skipped: no MONGO_URI (memory mode already has demo data).");
    process.exit(0);
  }

  // Default workspace every legacy doc belongs to.
  let org = await Organization.findOne({ slug: ORG_SLUG });
  if (!org) {
    org = await Organization.create({
      name: ORG_NAME,
      slug: ORG_SLUG,
      plan: "pro",
      planCycle: "monthly",
      status: "active",
      seats: 25,
    });
    console.log(`Seeded org ${ORG_SLUG}`);
  }
  const orgId = org._id;
  if (!await Subscription.findOne({ orgId }).catch(() => null)) {
    await Subscription.create({ orgId, plan: org.plan, cycle: "monthly", status: "active" });
  }

  // Phase-0 migration: uniqueness moved from global to per-workspace, so the
  // old global unique indexes must go or new orgs can't reuse numbers/emails.
  await dropIndexIfExists(User, "email_1");
  await dropIndexIfExists(Ticket, "ticketId_1");

  // Backfill anything created before orgs existed into the default workspace.
  await User.updateMany({ orgId: { $exists: false } }, { $set: { orgId } });
  await Customer.updateMany({ orgId: { $exists: false } }, { $set: { orgId } });
  await Article.updateMany({ orgId: { $exists: false } }, { $set: { orgId } });
  await Ticket.updateMany({ orgId: { $exists: false } }, { $set: { orgId } });

  // Admin
  let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase(), orgId });
  if (!admin) {
    admin = await User.create({
      name: process.env.SEED_ADMIN_NAME || "Ricoz Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
      orgId,
    });
    console.log(`Seeded admin ${ADMIN_EMAIL}`);
  }
  // Demo agents
  for (const [name, email] of [["Sana K.", "sana@ricoz.local"], ["Arjun P.", "arjun@ricoz.local"], ["Mira S.", "mira@ricoz.local"]]) {
    if (!(await User.findOne({ email, orgId }))) {
      await User.create({ name, email, passwordHash: await bcrypt.hash("Agent123!", 10), role: "agent", orgId });
    }
  }

  if ((await Customer.countDocuments({ orgId })) === 0) {
    await Customer.insertMany(
      memory.customers.map((c) => ({ name: c.name, email: c.email, company: c.company, health: c.health, csat: c.csat, orgId }))
    );
    console.log("Seeded customers");
  }
  if ((await Article.countDocuments({ orgId })) === 0) {
    await Article.insertMany(
      memory.articles.map((a) => ({ title: a.title, body: a.body, category: a.category, views: a.views, helpfulYes: a.helpfulYes, helpfulNo: a.helpfulNo, orgId }))
    );
    console.log("Seeded articles");
  }
  if ((await Ticket.countDocuments({ orgId })) === 0) {
    const customers = await Customer.find({ orgId });
    const byName = Object.fromEntries(customers.map((c) => [c.name, c]));
    // Continue the global sequence for this org so existing RC- numbers never collide.
    const globalCounter = await Counter.findOne({ key: "ticket" }).catch(() => null);
    const seq = Math.max(globalCounter?.seq || 1042, 1043);
    await Counter.findOneAndUpdate({ key: `ticket:${orgId}` }, { $setOnInsert: { seq } }, { upsert: true });
    const docs = memory.tickets.map((t, i) => ({
      ticketId: t.ticketId,
      orgId,
      subject: t.subject,
      description: t.description,
      customer: byName[t.customerName]?._id,
      customerName: t.customerName,
      company: t.company,
      channel: t.channel,
      priority: t.priority,
      status: t.status,
      agentName: t.agentName,
      slaDueAt: t.slaDueAt || slaDueAt(t.priority),
      sentiment: t.sentiment,
      messages: t.messages.map((m) => ({ from: ["customer", "agent", "internal"].includes(m.from) ? m.from : "agent", author: m.author, text: m.text, at: m.at })),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
    await Ticket.insertMany(docs);
    console.log("Seeded tickets");
  }

  console.log(`Seed complete (org=${ORG_SLUG}, seats=${org.seats}, plan=${org.plan}).`);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
