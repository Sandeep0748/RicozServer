import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDb, isDbConnected } from "./config/db.js";
import User from "./models/User.js";
import Customer from "./models/Customer.js";
import Ticket from "./models/Ticket.js";
import Article from "./models/Article.js";
import Counter from "./models/Counter.js";
import { slaDueAt } from "./utils/sla.js";
import { memory } from "./store/memoryStore.js";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@ricoz.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123!";



async function run() {
  await connectDb(process.env.MONGO_URI);
  if (!isDbConnected()) {
    console.log("Seed skipped: no MONGO_URI (memory mode already has demo data).");
    process.exit(0);
  }

  // Admin
  let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (!admin) {
    admin = await User.create({
      name: process.env.SEED_ADMIN_NAME || "Ricoz Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
    });
    console.log(`Seeded admin ${ADMIN_EMAIL}`);
  }
  // Demo agents
  for (const [name, email] of [["Sana K.", "sana@ricoz.local"], ["Arjun P.", "arjun@ricoz.local"], ["Mira S.", "mira@ricoz.local"]]) {
    if (!(await User.findOne({ email }))) {
      await User.create({ name, email, passwordHash: await bcrypt.hash("Agent123!", 10), role: "agent" });
    }
  }

  if ((await Customer.countDocuments()) === 0) {
    await Customer.insertMany(
      memory.customers.map((c) => ({ name: c.name, email: c.email, company: c.company, health: c.health, csat: c.csat }))
    );
    console.log("Seeded customers");
  }
  if ((await Article.countDocuments()) === 0) {
    await Article.insertMany(
      memory.articles.map((a) => ({ title: a.title, body: a.body, category: a.category, views: a.views, helpfulYes: a.helpfulYes, helpfulNo: a.helpfulNo }))
    );
    console.log("Seeded articles");
  }
  if ((await Ticket.countDocuments()) === 0) {
    const customers = await Customer.find();
    const byName = Object.fromEntries(customers.map((c) => [c.name, c]));
    await Counter.findOneAndUpdate({ key: "ticket" }, { $set: { seq: 1043 } }, { upsert: true });
    const docs = memory.tickets.map((t, i) => ({
      ticketId: t.ticketId,
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

  console.log("Seed complete.");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
