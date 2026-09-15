import { Router } from "express";
import { body, validationResult } from "express-validator";
import Ticket from "../models/Ticket.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import { nextTicketId } from "../models/Counter.js";
import { isDbConnected } from "../config/db.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import { serializeTicket, pageOf } from "../utils/serialize.js";
import { slaDueAt } from "../utils/sla.js";
import { memory, nextMemoryTicketId } from "../store/memoryStore.js";
import { entitlements, effectivePlan } from "../config/plans.js";
import { loadOrg } from "../config/orgLoader.js";

const router = Router();
router.use(protect);

function orgIdOf(req) {
  return req.orgId;
}

// IDOR-safe lookup: a ticket is only visible inside its own workspace.
async function findTicketScoped(id, orgId) {
  const doc = await Ticket.findOne({ ticketId: id, orgId }).catch(() => null);
  if (doc) return doc;
  return Ticket.findOne({ _id: id, orgId }).catch(() => null);
}

function findMemoryTicket(id, orgId) {
  return memory.tickets.find((x) => String(x.orgId) === String(orgId) && (x.ticketId === id || x.id === id));
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Monthly ticket-volume gate (strategy: overage/upgrade on volume).
async function ticketLimitReached(orgId) {
  const org = await loadOrg(orgId);
  if (!org) return false;
  const limit = entitlements(effectivePlan(org)).ticketsPerMonth;
  if (limit < 0) return false; // unlimited
  const monthStart = startOfMonth();
  const used = isDbConnected()
    ? await Ticket.countDocuments({ orgId, createdAt: { $gte: monthStart } })
    : memory.tickets.filter((t) => String(t.orgId) === String(orgId) && new Date(t.createdAt) >= monthStart).length;
  return used >= limit;
}

function matches(t, orgId, { status, priority, channel, search }) {
  if (String(t.orgId) !== String(orgId)) return false;
  if (status && t.status !== status) return false;
  if (priority && t.priority !== priority) return false;
  if (channel && t.channel !== channel) return false;
  if (search) {
    const s = search.toLowerCase();
    const hay = `${t.ticketId || t.id} ${t.subject} ${t.customerName || t.customer} ${t.company}`.toLowerCase();
    if (!hay.includes(s)) return false;
  }
  return true;
}

// GET /api/tickets?status,priority,channel,search,page,limit
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, priority, channel, search, page = "1", limit = "20" } = req.query;
    const pg = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    if (isDbConnected()) {
      const filter = { orgId: orgIdOf(req) };
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (channel) filter.channel = channel;
      if (search) {
        filter.$or = [
          { subject: new RegExp(search, "i") },
          { ticketId: new RegExp(search, "i") },
          { customerName: new RegExp(search, "i") },
          { company: new RegExp(search, "i") },
        ];
      }
      const total = await Ticket.countDocuments(filter);
      const docs = await Ticket.find(filter).sort({ updatedAt: -1 }).skip((pg - 1) * lim).limit(lim);
      return res.json(pageOf(docs.map(serializeTicket), total, pg, lim));
    }

    const filtered = [...memory.tickets].filter((t) => matches(t, orgIdOf(req), { status, priority, channel, search })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const total = filtered.length;
    const rows = filtered.slice((pg - 1) * lim, pg * lim).map(serializeTicket);
    return res.json(pageOf(rows, total, pg, lim));
  })
);

// POST /api/tickets
router.post(
  "/",
  [body("subject").notEmpty().withMessage("Subject required")],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    const { subject, description, customerName, company, channel = "Email", priority = "Medium", customerId, sentiment = "Neutral" } = req.body;
    const orgId = orgIdOf(req);

    if (await ticketLimitReached(orgId)) {
      return res.status(402).json({ error: "Monthly ticket limit reached for your plan. Upgrade to keep creating tickets.", code: "TICKET_LIMIT" });
    }

    if (isDbConnected()) {
      let customer = null;
      if (customerId) customer = await Customer.findOne({ _id: customerId, orgId }).catch(() => null);
      const ticketId = await nextTicketId(orgId);
      const doc = await Ticket.create({
        ticketId,
        orgId,
        subject,
        description: description || subject,
        customer: customer?._id,
        customerName: customer?.name || customerName || "Guest",
        company: customer?.company || company || "",
        channel,
        priority,
        status: "Open",
        agentName: "Unassigned",
        slaDueAt: slaDueAt(priority),
        sentiment,
        messages: [{ from: "customer", author: customer?.name || customerName || "Guest", text: description || subject, at: new Date() }],
      });
      return res.status(201).json(serializeTicket(doc));
    }

    const ticketId = nextMemoryTicketId(orgIdOf(req));
    const t = {
      id: `t-${Date.now()}`,
      ticketId,
      orgId: orgIdOf(req),
      subject,
      description: description || subject,
      customer: customerId || null,
      customerName: customerName || "Guest",
      company: company || "",
      channel,
      priority,
      status: "Open",
      agentName: "Unassigned",
      slaDueAt: slaDueAt(priority),
      sentiment,
      messages: [{ from: "customer", author: customerName || "Guest", text: description || subject, at: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memory.tickets.unshift(t);
    return res.status(201).json(serializeTicket(t));
  })
);

// GET /api/tickets/:id  (accepts RC-XXXX or mongo id)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (isDbConnected()) {
      const doc = await findTicketScoped(id, orgIdOf(req));
      if (!doc) return res.status(404).json({ error: "Ticket not found" });
      return res.json(serializeTicket(doc));
    }
    const t = findMemoryTicket(id, orgIdOf(req));
    if (!t) return res.status(404).json({ error: "Ticket not found" });
    return res.json(serializeTicket(t));
  })
);

// PATCH /api/tickets/:id  {status,priority,agentName,channel}
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, priority, agentName, channel } = req.body;
    if (isDbConnected()) {
      const doc = await findTicketScoped(id, orgIdOf(req));
      if (!doc) return res.status(404).json({ error: "Ticket not found" });
      if (status) doc.status = status;
      if (channel) doc.channel = channel;
      if (agentName) {
        doc.agentName = agentName;
        const agent = await User.findOne({ name: new RegExp(`^${agentName}$`, "i"), orgId: orgIdOf(req) });
        if (agent) doc.agent = agent._id;
      }
      if (priority && priority !== doc.priority) {
        doc.priority = priority;
        doc.slaDueAt = slaDueAt(priority);
      }
      await doc.save();
      return res.json(serializeTicket(doc));
    }
    const t = findMemoryTicket(id, orgIdOf(req));
    if (!t) return res.status(404).json({ error: "Ticket not found" });
    if (status) t.status = status;
    if (channel) t.channel = channel;
    if (agentName) t.agentName = agentName;
    if (priority && priority !== t.priority) {
      t.priority = priority;
      t.slaDueAt = slaDueAt(priority);
    }
    t.updatedAt = new Date();
    return res.json(serializeTicket(t));
  })
);

// POST /api/tickets/:id/replies {text, author?}
router.post(
  "/:id/replies",
  [body("text").notEmpty().withMessage("Reply text required")],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    const { id } = req.params;
    const { text, author } = req.body;
    const msg = { from: "agent", author: author || "Agent", text, at: new Date() };

    if (isDbConnected()) {
      const doc = await findTicketScoped(id, orgIdOf(req));
      if (!doc) return res.status(404).json({ error: "Ticket not found" });
      doc.messages.push(msg);
      await doc.save();
      return res.status(201).json(serializeTicket(doc));
    }
    const t = findMemoryTicket(id, orgIdOf(req));
    if (!t) return res.status(404).json({ error: "Ticket not found" });
    t.messages.push(msg);
    t.updatedAt = new Date();
    return res.status(201).json(serializeTicket(t));
  })
);

export default router;
