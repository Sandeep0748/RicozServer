import { Router } from "express";
import { body, validationResult } from "express-validator";
import { isDbConnected } from "../config/db.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import Customer from "../models/Customer.js";
import {
  Item, Invoice, Estimate, RecurringInvoice, Expense, Project,
  TimeEntry, CreditNote, DebitNote, Notification,
} from "../models/Billing.js";
import {
  serializeCustomer, serializeItem, serializeInvoice, serializeEstimate,
  serializeGeneric, pageOf,
} from "../utils/serialize.js";
import { memory } from "../store/memoryStore.js";

const router = Router();
router.use(protect);
const orgOf = (req) => req.orgId;
const bad = (req, res) => {
  const e = validationResult(req);
  if (!e.isEmpty()) { res.status(400).json({ error: e.array()[0].msg }); return true; }
  return false;
};
function memList(key, orgId) {
  return (memory[key] || []).filter((x) => String(x.orgId) === String(orgId));
}
function memPaged(list, page, limit) {
  const pg = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  return { rows: list.slice((pg - 1) * lim, pg * lim), total: list.length, pg, lim };
}
function totals(lines = []) {
  let sub = 0; let tax = 0;
  for (const l of lines) {
    const qty = Number(l.qty) || 0; const rate = Number(l.rate) || 0; const tr = Number(l.taxRate) || 0;
    const amt = qty * rate;
    l.amount = amt;
    sub += amt; tax += Math.round((amt * tr) / 100);
  }
  return { subtotal: sub, taxTotal: tax, total: sub + tax };
}
function nextNum(prefix, seq) {
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}
async function resolveCustomer(orgId, idOrName) {
  if (!idOrName) return {};
  if (isDbConnected()) {
    const c = (await Customer.findOne({ _id: idOrName, orgId }).catch(() => null))
      || (await Customer.findOne({ name: idOrName, orgId }));
    if (!c) return {};
    return { customer: c._id, customerName: c.name, company: c.company || "" };
  }
  const c = memory.customers.find((x) => String(x.orgId) === String(orgId) && (x.id === idOrName || x.name === idOrName));
  if (!c) return { customerName: idOrName };
  return { customer: c.id, customerName: c.name, company: c.company || "" };
}

// ---------- ITEMS ----------
router.get("/items", asyncHandler(async (req, res) => {
  const { search, type, page = "1", limit = "20" } = req.query;
  if (isDbConnected()) {
    const f = { orgId: orgOf(req) };
    if (type && type !== "all") f.type = type;
    if (search) f.$or = [{ name: new RegExp(search, "i") }, { sku: new RegExp(search, "i") }, { description: new RegExp(search, "i") }];
    const pg = Math.max(1, parseInt(page, 10) || 1); const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const total = await Item.countDocuments(f);
    const docs = await Item.find(f).sort({ updatedAt: -1 }).skip((pg - 1) * lim).limit(lim);
    return res.json({ ...pageOf(docs.map(serializeItem), total, pg, lim), stats: await itemStats(orgOf(req)) });
  }
  let list = memList("items", orgOf(req)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  if (type && type !== "all") list = list.filter((x) => x.type === type);
  if (search) { const s = search.toLowerCase(); list = list.filter((x) => `${x.name} ${x.sku} ${x.description}`.toLowerCase().includes(s)); }
  const { rows, total, pg, lim } = memPaged(list, page, limit);
  const all = memList("items", orgOf(req));
  res.json({ ...pageOf(rows.map(serializeItem), total, pg, lim), stats: { total: all.length, services: all.filter((x) => x.type === "service").length, products: all.filter((x) => x.type !== "service").length } });
}));
async function itemStats(orgId) {
  if (!isDbConnected()) return null;
  const [total, services] = await Promise.all([Item.countDocuments({ orgId }), Item.countDocuments({ orgId, type: "service" })]);
  return { total, services, products: total - services };
}
router.post("/items", [body("name").notEmpty().withMessage("Name required")], asyncHandler(async (req, res) => {
  if (bad(req, res)) return;
  const { name, sku = "", description = "", type = "product", rate = 0, taxRate = 0, unit = "pcs" } = req.body;
  if (isDbConnected()) {
    const doc = await Item.create({ name, sku, description, type, rate, taxRate, unit, orgId: orgOf(req) });
    return res.status(201).json(serializeItem(doc));
  }
  const it = { id: `it-${Date.now()}`, orgId: orgOf(req), name, sku, description, type, rate: Number(rate) || 0, taxRate: Number(taxRate) || 0, unit, createdAt: new Date(), updatedAt: new Date() };
  memory.items.unshift(it);
  res.status(201).json(serializeItem(it));
}));
router.delete("/items/:id", asyncHandler(async (req, res) => {
  if (isDbConnected()) { await Item.deleteOne({ _id: req.params.id, orgId: orgOf(req) }); return res.json({ ok: true }); }
  memory.items = memory.items.filter((x) => !(String(x.id) === String(req.params.id) && String(x.orgId) === String(orgOf(req))));
  res.json({ ok: true });
}));

// ---------- INVOICES ----------
router.get("/invoices", asyncHandler(async (req, res) => {
  const { search, status, page = "1", limit = "20" } = req.query;
  if (isDbConnected()) {
    const f = { orgId: orgOf(req) };
    if (status && status !== "all") f.status = status;
    if (search) f.$or = [{ number: new RegExp(search, "i") }, { customerName: new RegExp(search, "i") }];
    const pg = Math.max(1, parseInt(page, 10) || 1); const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const total = await Invoice.countDocuments(f);
    const docs = await Invoice.find(f).sort({ updatedAt: -1 }).skip((pg - 1) * lim).limit(lim);
    return res.json({ ...pageOf(docs.map(serializeInvoice), total, pg, lim), stats: await invoiceStats(orgOf(req)) });
  }
  let list = memList("invoices", orgOf(req)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  if (status && status !== "all") list = list.filter((x) => x.status === status);
  if (search) { const s = search.toLowerCase(); list = list.filter((x) => `${x.number} ${x.customerName}`.toLowerCase().includes(s)); }
  const { rows, total, pg, lim } = memPaged(list, page, limit);
  res.json({ ...pageOf(rows.map(serializeInvoice), total, pg, lim), stats: memInvoiceStats(orgOf(req)) });
}));
function memInvoiceStats(orgId) {
  const all = memList("invoices", orgOf);
  const list = memList("invoices", orgId);
  const out = list.reduce((a, x) => a + (x.total || 0), 0);
  return {
    loaded: list.length, awaiting: list.filter((x) => ["sent", "draft", "partial"].includes(x.status)).length,
    overdue: list.filter((x) => x.status === "overdue").length, outstanding: out - list.reduce((a, x) => a + (x.paid || 0), 0),
    _all: all.length,
  };
}
async function invoiceStats(orgId) {
  const docs = await Invoice.find({ orgId });
  const out = docs.reduce((a, x) => a + (x.total || 0), 0);
  const paid = docs.reduce((a, x) => a + (x.paid || 0), 0);
  return {
    loaded: docs.length, awaiting: docs.filter((x) => ["sent", "draft", "partial"].includes(x.status)).length,
    overdue: docs.filter((x) => x.status === "overdue").length, outstanding: out - paid,
  };
}
router.post("/invoices", [body("customer").notEmpty().withMessage("Customer required")], asyncHandler(async (req, res) => {
  if (bad(req, res)) return;
  const orgId = orgOf(req);
  const cust = await resolveCustomer(orgId, req.body.customer);
  const lines = Array.isArray(req.body.lines) && req.body.lines.length ? req.body.lines : [{ name: "Service", qty: 1, rate: Number(req.body.total) || 0, taxRate: 0 }];
  const t = totals(lines);
  const base = {
    ...cust, lines, ...t, paid: 0,
    issueDate: req.body.issueDate || new Date(), dueDate: req.body.dueDate || new Date(Date.now() + 30 * 864e5),
    status: "sent", paymentTerms: req.body.paymentTerms || "Net 30", notes: req.body.notes || "",
    orgId, payments: [],
  };
  if (isDbConnected()) {
    const count = await Invoice.countDocuments({ orgId });
    const doc = await Invoice.create({ ...base, number: nextNum("INV", count + 1) });
    notify(orgId, "Invoice created", `${doc.number} for ${doc.customerName} — ₹${(doc.total / 100).toFixed(2)}`, "/invoices");
    return res.status(201).json(serializeInvoice(doc));
  }
  const seq = (memory.seq.invoice = (memory.seq.invoice || 1));
  memory.seq.invoice += 1;
  const doc = { id: `inv-${Date.now()}`, ...base, number: nextNum("INV", seq), createdAt: new Date(), updatedAt: new Date() };
  memory.invoices.unshift(doc);
  memNotify(orgId, "Invoice created", `${doc.number} for ${doc.customerName}`, "/invoices");
  res.status(201).json(serializeInvoice(doc));
}));
router.get("/invoices/:id", asyncHandler(async (req, res) => {
  const orgId = orgOf(req);
  if (isDbConnected()) {
    const d = (await Invoice.findOne({ _id: req.params.id, orgId }).catch(() => null)) || (await Invoice.findOne({ number: req.params.id, orgId }));
    if (!d) return res.status(404).json({ error: "Invoice not found" });
    return res.json(serializeInvoice(d));
  }
  const d = memList("invoices", orgId).find((x) => x.id === req.params.id || x.number === req.params.id);
  if (!d) return res.status(404).json({ error: "Invoice not found" });
  res.json(serializeInvoice(d));
}));
router.post("/invoices/:id/pay", [body("amount").isInt({ min: 1 }).withMessage("Amount required (paise)")], asyncHandler(async (req, res) => {
  if (bad(req, res)) return;
  const orgId = orgOf(req);
  const { amount, method = "UPI", note = "" } = req.body;
  if (isDbConnected()) {
    const d = (await Invoice.findOne({ _id: req.params.id, orgId }).catch(() => null)) || (await Invoice.findOne({ number: req.params.id, orgId }));
    if (!d) return res.status(404).json({ error: "Invoice not found" });
    d.payments.push({ amount: Number(amount), method, note });
    d.paid = (d.paid || 0) + Number(amount);
    d.status = d.paid >= d.total ? "paid" : "partial";
    await d.save();
    return res.json(serializeInvoice(d));
  }
  const d = memList("invoices", orgId).find((x) => x.id === req.params.id || x.number === req.params.id);
  if (!d) return res.status(404).json({ error: "Invoice not found" });
  d.payments.push({ amount: Number(amount), date: new Date(), method, note });
  d.paid = (d.paid || 0) + Number(amount);
  d.status = d.paid >= d.total ? "paid" : "partial";
  d.updatedAt = new Date();
  res.json(serializeInvoice(d));
}));

// ---------- ESTIMATES ----------
router.get("/estimates", asyncHandler(async (req, res) => {
  const { search, status, page = "1", limit = "20" } = req.query;
  if (isDbConnected()) {
    const f = { orgId: orgOf(req) };
    if (status && status !== "all") f.status = status;
    if (search) f.$or = [{ number: new RegExp(search, "i") }, { customerName: new RegExp(search, "i") }];
    const pg = Math.max(1, parseInt(page, 10) || 1); const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const total = await Estimate.countDocuments(f);
    const docs = await Estimate.find(f).sort({ updatedAt: -1 }).skip((pg - 1) * lim).limit(lim);
    const all = await Estimate.find({ orgId: orgOf(req) });
    return res.json({ ...pageOf(docs.map(serializeEstimate), total, pg, lim), stats: estStats(all) });
  }
  let list = memList("estimates", orgOf(req)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  if (status && status !== "all") list = list.filter((x) => x.status === status);
  if (search) { const s = search.toLowerCase(); list = list.filter((x) => `${x.number} ${x.customerName}`.toLowerCase().includes(s)); }
  const { rows, total, pg, lim } = memPaged(list, page, limit);
  res.json({ ...pageOf(rows.map(serializeEstimate), total, pg, lim), stats: estStats(memList("estimates", orgOf(req))) });
}));
function estStats(all) {
  return {
    loaded: all.length, awaiting: all.filter((x) => ["sent", "draft"].includes(x.status)).length,
    accepted: all.filter((x) => x.status === "accepted").length, converted: all.filter((x) => x.status === "converted").length,
  };
}
router.post("/estimates", [body("customer").notEmpty().withMessage("Customer required")], asyncHandler(async (req, res) => {
  if (bad(req, res)) return;
  const orgId = orgOf(req);
  const cust = await resolveCustomer(orgId, req.body.customer);
  const lines = Array.isArray(req.body.lines) && req.body.lines.length ? req.body.lines : [{ name: "Proposed work", qty: 1, rate: Number(req.body.total) || 0, taxRate: 0 }];
  const t = totals(lines);
  const base = { ...cust, lines, ...t, validTill: req.body.validTill || new Date(Date.now() + 15 * 864e5), status: "sent", notes: req.body.notes || "", orgId };
  if (isDbConnected()) {
    const count = await Estimate.countDocuments({ orgId });
    const doc = await Estimate.create({ ...base, number: nextNum("EST", count + 1) });
    return res.status(201).json(serializeEstimate(doc));
  }
  const seq = memory.seq.estimate = (memory.seq.estimate || 1);
  memory.seq.estimate += 1;
  const doc = { id: `est-${Date.now()}`, ...base, number: nextNum("EST", seq), createdAt: new Date(), updatedAt: new Date() };
  memory.estimates.unshift(doc);
  res.status(201).json(serializeEstimate(doc));
}));
router.post("/estimates/:id/convert", asyncHandler(async (req, res) => {
  const orgId = orgOf(req);
  if (isDbConnected()) {
    const e = (await Estimate.findOne({ _id: req.params.id, orgId }).catch(() => null)) || (await Estimate.findOne({ number: req.params.id, orgId }));
    if (!e) return res.status(404).json({ error: "Estimate not found" });
    const count = await Invoice.countDocuments({ orgId });
    const inv = await Invoice.create({
      orgId, customer: e.customer, customerName: e.customerName, company: e.company,
      lines: e.lines, subtotal: e.subtotal, taxTotal: e.taxTotal, total: e.total, paid: 0,
      status: "sent", number: nextNum("INV", count + 1), dueDate: new Date(Date.now() + 30 * 864e5),
    });
    e.status = "converted"; e.convertedTo = inv._id; await e.save();
    return res.status(201).json(serializeInvoice(inv));
  }
  const e = memList("estimates", orgId).find((x) => x.id === req.params.id || x.number === req.params.id);
  if (!e) return res.status(404).json({ error: "Estimate not found" });
  const seq = memory.seq.invoice = (memory.seq.invoice || 1);
  memory.seq.invoice += 1;
  const inv = { id: `inv-${Date.now()}`, orgId, customer: e.customer, customerName: e.customerName, company: e.company, lines: e.lines, subtotal: e.subtotal, taxTotal: e.taxTotal, total: e.total, paid: 0, status: "sent", number: nextNum("INV", seq), issueDate: new Date(), dueDate: new Date(Date.now() + 30 * 864e5), paymentTerms: "Net 30", notes: "", payments: [], createdAt: new Date(), updatedAt: new Date() };
  memory.invoices.unshift(inv);
  e.status = "converted"; e.convertedTo = inv.id; e.updatedAt = new Date();
  res.status(201).json(serializeInvoice(inv));
}));
router.patch("/estimates/:id", asyncHandler(async (req, res) => {
  const orgId = orgOf(req);
  const { status } = req.body;
  if (isDbConnected()) {
    const e = (await Estimate.findOne({ _id: req.params.id, orgId }).catch(() => null)) || (await Estimate.findOne({ number: req.params.id, orgId }));
    if (!e) return res.status(404).json({ error: "Estimate not found" });
    if (status) e.status = status;
    await e.save();
    return res.json(serializeEstimate(e));
  }
  const e = memList("estimates", orgId).find((x) => x.id === req.params.id || x.number === req.params.id);
  if (!e) return res.status(404).json({ error: "Estimate not found" });
  if (status) e.status = status;
  e.updatedAt = new Date();
  res.json(serializeEstimate(e));
}));

// ---------- GENERIC CRUD for recurring/expenses/projects/time/notes/notifications ----------
function crud(path, Model, memKey, opts = {}) {
  router.get(`/${path}`, asyncHandler(async (req, res) => {
    const { search, page = "1", limit = "20" } = req.query;
    if (isDbConnected()) {
      const f = { orgId: orgOf(req) };
      if (search && opts.searchFields) f.$or = opts.searchFields.map((k) => ({ [k]: new RegExp(search, "i") }));
      const pg = Math.max(1, parseInt(page, 10) || 1); const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const total = await Model.countDocuments(f);
      const docs = await Model.find(f).sort({ updatedAt: -1 }).skip((pg - 1) * lim).limit(lim);
      return res.json(pageOf(docs.map(serializeGeneric), total, pg, lim));
    }
    let list = memList(memKey, orgOf(req)).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    if (search && opts.searchFields) { const s = search.toLowerCase(); list = list.filter((x) => opts.searchFields.some((k) => String(x[k] || "").toLowerCase().includes(s))); }
    if (opts.filter && req.query[opts.filter]) list = list.filter((x) => String(x[opts.filter]) === String(req.query[opts.filter]));
    const { rows, total, pg, lim } = memPaged(list, page, limit);
    res.json(pageOf(rows.map(serializeGeneric), total, pg, lim));
  }));
  router.post(`/${path}`, opts.validate || [], asyncHandler(async (req, res) => {
    if (bad(req, res)) return;
    const orgId = orgOf(req);
    let extra = {};
    if (opts.resolveCustomer && req.body.customer) extra = await resolveCustomer(orgId, req.body.customer);
    if (opts.numberPrefix && isDbConnected()) {
      const count = await Model.countDocuments({ orgId });
      extra.number = nextNum(opts.numberPrefix, count + 1);
    }
    const payload = { ...req.body, ...extra, orgId };
    if (isDbConnected()) {
      const doc = await Model.create(payload);
      return res.status(201).json(serializeGeneric(doc.toObject ? doc.toObject() : doc));
    }
    if (opts.numberPrefix) {
      const key = opts.numberPrefix === "CN" ? "credit" : opts.numberPrefix === "DN" ? "debit" : "seq";
      memory.seq[key] = memory.seq[key] || 1;
      payload.number = nextNum(opts.numberPrefix, memory.seq[key]);
      memory.seq[key] += 1;
    }
    const doc = { id: `${memKey}-${Date.now()}`, ...payload, createdAt: new Date(), updatedAt: new Date() };
    memory[memKey].unshift(doc);
    res.status(201).json(serializeGeneric(doc));
  }));
  router.delete(`/${path}/:id`, asyncHandler(async (req, res) => {
    if (isDbConnected()) { await Model.deleteOne({ _id: req.params.id, orgId: orgOf(req) }); return res.json({ ok: true }); }
    memory[memKey] = memory[memKey].filter((x) => !(String(x.id) === String(req.params.id) && String(x.orgId) === String(orgOf(req))));
    res.json({ ok: true });
  }));
}

crud("recurring", RecurringInvoice, "recurring", { searchFields: ["customerName"] });
crud("expenses", Expense, "expenses", { searchFields: ["vendor", "category", "notes"] });
crud("projects", Project, "projects", { searchFields: ["name", "description"], validate: [body("name").notEmpty().withMessage("Project name required")] });
crud("time", TimeEntry, "timeEntries", { searchFields: ["task", "projectName", "customerName"] });
crud("credit-notes", CreditNote, "creditNotes", { searchFields: ["customerName", "number"], resolveCustomer: true, numberPrefix: "CN", validate: [body("customer").notEmpty().withMessage("Customer required")] });
crud("debit-notes", DebitNote, "debitNotes", { searchFields: ["customerName", "number"], resolveCustomer: true, numberPrefix: "DN", validate: [body("customer").notEmpty().withMessage("Customer required")] });

// ---------- NOTIFICATIONS ----------
router.get("/notifications", asyncHandler(async (req, res) => {
  const { search } = req.query;
  if (isDbConnected()) {
    const f = { orgId: orgOf(req) };
    if (search) f.$or = [{ title: new RegExp(search, "i") }, { body: new RegExp(search, "i") }];
    const docs = await Notification.find(f).sort({ createdAt: -1 }).limit(50);
    return res.json({ data: docs.map(serializeGeneric), total: docs.length, unread: docs.filter((d) => !d.read).length });
  }
  let list = memList("notifications", orgOf(req)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (search) { const s = search.toLowerCase(); list = list.filter((x) => `${x.title} ${x.body}`.toLowerCase().includes(s)); }
  res.json({ data: list.map(serializeGeneric), total: list.length, unread: list.filter((x) => !x.read).length });
}));
router.post("/notifications/read-all", asyncHandler(async (req, res) => {
  if (isDbConnected()) { await Notification.updateMany({ orgId: orgOf(req) }, { $set: { read: true } }); return res.json({ ok: true }); }
  memList("notifications", orgOf(req)).forEach((x) => { x.read = true; });
  res.json({ ok: true });
}));
function memNotify(orgId, title, nbody, link) {
  memory.notifications.unshift({ id: `n-${Date.now()}`, orgId, title, body: nbody, type: "info", read: false, link: link || "", createdAt: new Date(), updatedAt: new Date() });
}
async function notify(orgId, title, nbody, link) {
  if (isDbConnected()) { await Notification.create({ orgId, title, body: nbody, link: link || "" }).catch(() => null); return; }
  memNotify(orgId, title, nbody, link);
}

// ---------- OVERVIEW (financial) ----------
router.get("/overview", asyncHandler(async (req, res) => {
  const orgId = orgOf(req);
  let invoices = []; let expenses = []; let payments = [];
  if (isDbConnected()) {
    invoices = await Invoice.find({ orgId }).sort({ updatedAt: -1 });
    expenses = await Expense.find({ orgId });
    invoices.forEach((inv) => (inv.payments || []).forEach((p) => payments.push({ ...p.toObject?.() || p, invoiceNumber: inv.number, customerName: inv.customerName, date: p.date })));
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    invoices = memList("invoices", orgId);
    expenses = memList("expenses", orgId);
    invoices.forEach((inv) => (inv.payments || []).forEach((p) => payments.push({ ...p, invoiceNumber: inv.number, customerName: inv.customerName })));
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  const billed = invoices.reduce((a, x) => a + (x.total || 0), 0);
  const collected = invoices.reduce((a, x) => a + (x.paid || 0), 0);
  const outstanding = billed - collected;
  const overdue = invoices.filter((x) => x.status === "overdue").reduce((a, x) => a + ((x.total || 0) - (x.paid || 0)), 0);
  const spent = expenses.reduce((a, x) => a + (x.amount || 0), 0);
  const nowD = new Date();
  const buckets = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
  invoices.filter((x) => (x.total || 0) > (x.paid || 0)).forEach((x) => {
    const due = x.dueDate ? new Date(x.dueDate) : new Date(x.createdAt);
    const days = Math.max(0, Math.round((nowD - due) / 864e5));
    const bal = (x.total || 0) - (x.paid || 0);
    if (days <= 30) buckets["0-30"] += bal; else if (days <= 60) buckets["31-60"] += bal; else if (days <= 90) buckets["61-90"] += bal; else buckets["90+"] += bal;
  });
  res.json({
    cards: {
      billed, collected, outstanding, spent,
      billedCount: invoices.length, paidCount: invoices.filter((x) => x.status === "paid").length,
      openCount: invoices.filter((x) => !["paid", "void"].includes(x.status)).length, overdue,
    },
    cashFlow: cashSeries(invoices, expenses),
    recentInvoices: invoices.slice(0, 5).map(serializeInvoice),
    recentPayments: payments.slice(0, 5),
    aging: buckets,
    mode: isDbConnected() ? "mongo" : "memory",
  });
}));
function cashSeries(invoices, expenses) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString("en", { month: "short" });
    const billed = invoices.filter((x) => new Date(x.createdAt).getMonth() === d.getMonth()).reduce((a, x) => a + (x.total || 0), 0);
    const spent = expenses.filter((x) => new Date(x.date || x.createdAt).getMonth() === d.getMonth()).reduce((a, x) => a + (x.amount || 0), 0);
    months.push({ month: key, billed: Math.round(billed / 100), collected: Math.round(billed * 0.7 / 100), spent: Math.round(spent / 100) });
  }
  return months;
}

// ---------- REPORTS ----------
router.get("/reports", asyncHandler(async (req, res) => {
  const orgId = orgOf(req);
  const { from, to, customer, type = "overview" } = req.query;
  const fromD = from ? new Date(from) : new Date(Date.now() - 30 * 864e5);
  const toD = to ? new Date(to) : new Date();
  let invoices = isDbConnected() ? await Invoice.find({ orgId }) : memList("invoices", orgId);
  let expenses = isDbConnected() ? await Expense.find({ orgId }) : memList("expenses", orgId);
  invoices = invoices.filter((x) => { const d = new Date(x.createdAt); return d >= fromD && d <= toD && (!customer || String(x.customerName) === String(customer) || String(x.customer) === String(customer)); });
  if (customer) expenses = expenses.filter((x) => String(x.customerName) === String(customer) || String(x.customer) === String(customer));
  const total = invoices.reduce((a, x) => a + (x.total || 0), 0);
  const paid = invoices.reduce((a, x) => a + (x.paid || 0), 0);
  const spent = expenses.reduce((a, x) => a + (x.amount || 0), 0);
  const billable = expenses.filter((x) => x.billable).reduce((a, x) => a + (x.amount || 0), 0);
  const byDay = {};
  invoices.forEach((x) => { const k = new Date(x.createdAt).toISOString().slice(0, 10); byDay[k] = (byDay[k] || 0) + (x.total || 0); });
  res.json({
    type, from: fromD, to: toD,
    summary: { total, count: invoices.length, paid, outstanding: total - paid, spent, billable, nonBillable: spent - billable },
    revenueTrend: Object.entries(byDay).sort().map(([date, v]) => ({ date, total: Math.round(v / 100) })),
    expenseTrend: [],
    mode: isDbConnected() ? "mongo" : "memory",
  });
}));

// ---------- TEAM ----------
router.get("/team", asyncHandler(async (req, res) => {
  const { default: User } = await import("../models/User.js");
  if (isDbConnected()) {
    const users = await User.find({ orgId: orgOf(req) }).sort({ createdAt: 1 }).limit(50);
    return res.json({ data: users.map((u) => u.toJSONSafe()), total: users.length });
  }
  const users = memory.users.filter((u) => String(u.orgId) === String(orgOf(req)));
  res.json({ data: users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active })), total: users.length });
}));

// ---------- SETTINGS ----------
router.get("/settings", asyncHandler(async (req, res) => {
  const { default: Organization } = await import("../models/Organization.js");
  if (isDbConnected()) {
    const org = await Organization.findById(orgOf(req));
    return res.json({ organization: org ? org.toJSONSafe() : null, currency: "INR", taxDefaults: { gst: 18 }, paymentModes: ["UPI", "Card", "Netbanking", "Cash"] });
  }
  const org = memory.orgs.find((o) => String(o.id) === String(orgOf(req)));
  res.json({ organization: org || null, currency: "INR", taxDefaults: { gst: 18 }, paymentModes: ["UPI", "Card", "Netbanking", "Cash"] });
}));

export default router;
