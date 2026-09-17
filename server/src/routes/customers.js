import { Router } from "express";
import { body, validationResult } from "express-validator";
import Customer from "../models/Customer.js";
import Ticket from "../models/Ticket.js";
import { isDbConnected } from "../config/db.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import { serializeCustomer, serializeTicket, pageOf } from "../utils/serialize.js";
import { memory } from "../store/memoryStore.js";

const router = Router();
router.use(protect);

function orgIdOf(req) {
  return req.orgId;
}

async function ticketCountFor(c, orgId) {
  if (isDbConnected()) {
    return Ticket.countDocuments({ orgId, $or: [{ customer: c._id }, { customerName: c.name }] });
  }
  return memory.tickets.filter(
    (t) => String(t.orgId) === String(orgId) && (String(t.customer) === String(c._id || c.id) || t.customerName === c.name)
  ).length;
}

// GET /api/customers?search,page,limit
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, page = "1", limit = "20" } = req.query;
    const pg = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    if (isDbConnected()) {
      const filter = search
        ? { orgId: orgIdOf(req), $or: [{ name: new RegExp(search, "i") }, { company: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] }
        : { orgId: orgIdOf(req) };
      const total = await Customer.countDocuments(filter);
      const docs = await Customer.find(filter).sort({ updatedAt: -1 }).skip((pg - 1) * lim).limit(lim);
      const rows = await Promise.all(
        docs.map(async (c) => {
          const count = await ticketCountFor(c, orgIdOf(req));
          return serializeCustomer(c, count);
        })
      );
      return res.json(pageOf(rows, total, pg, lim));
    }

    let list = memory.customers.filter((c) => String(c.orgId) === String(orgIdOf(req)));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(s));
    }
    const total = list.length;
    const rows = list.slice((pg - 1) * lim, pg * lim).map((c) => {
      const count = memory.tickets.filter(
        (t) => String(t.orgId) === String(orgIdOf(req)) && (String(t.customer) === String(c.id) || t.customerName === c.name)
      ).length;
      return serializeCustomer(c, count);
    });
    return res.json(pageOf(rows, total, pg, lim));
  })
);

// POST /api/customers
router.post(
  "/",
  [body("name").notEmpty().withMessage("Name required")],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    const { name, email, company, phone, health, csat, address, currency, gstin, contactPerson } = req.body;
    if (isDbConnected()) {
      const doc = await Customer.create({ name, email, company, phone, health, csat, address, currency, gstin, contactPerson, orgId: orgIdOf(req) });
      return res.status(201).json(serializeCustomer(doc, 0));
    }
    const c = { id: `c-${Date.now()}`, orgId: orgIdOf(req), name, email: email || "", company: company || "", phone: phone || "", health: health || "Healthy", csat: csat || 4.2, address: address || "", currency: currency || "INR", gstin: gstin || "", contactPerson: contactPerson || "", createdAt: new Date(), updatedAt: new Date() };
    memory.customers.unshift(c);
    return res.status(201).json(serializeCustomer(c, 0));
  })
);

// GET /api/customers/:id — 360 view with tickets
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const orgId = orgIdOf(req);
    if (isDbConnected()) {
      const c = (await Customer.findOne({ _id: id, orgId }).catch(() => null)) || (await Customer.findOne({ name: id, orgId }));
      if (!c) return res.status(404).json({ error: "Customer not found" });
      const tickets = await Ticket.find({ orgId, $or: [{ customer: c._id }, { customerName: c.name }] }).sort({ updatedAt: -1 }).limit(25);
      return res.json({ customer: serializeCustomer(c, tickets.length), tickets: tickets.map(serializeTicket) });
    }
    const c = memory.customers.find((x) => String(x.orgId) === String(orgId) && (x.id === id || x.name === id));
    if (!c) return res.status(404).json({ error: "Customer not found" });
    const tickets = memory.tickets.filter(
      (t) => String(t.orgId) === String(orgId) && (String(t.customer) === String(c.id) || t.customerName === c.name)
    ).map(serializeTicket);
    return res.json({ customer: serializeCustomer(c, tickets.length), tickets });
  })
);

export default router;
