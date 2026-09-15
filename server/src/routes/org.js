import { Router } from "express";
import { body, validationResult } from "express-validator";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import { isDbConnected } from "../config/db.js";
import { entitlements, effectivePlan, trialDaysLeft, isTrialActive } from "../config/plans.js";
import { loadOrg } from "../config/orgLoader.js";
import { protect, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import { memory } from "../store/memoryStore.js";

const router = Router();
router.use(protect);

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/org — current workspace, plan, entitlements, trial and usage.
// Powers the Settings > Billing tab and every upgrade prompt (Phase 1+).
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const org = await loadOrg(req.orgId);
    if (!org) return res.status(404).json({ error: "Workspace not found" });
    const plan = effectivePlan(org);
    const monthStart = startOfMonth();
    let seatsUsed = 0;
    let ticketsThisMonth = 0;
    let subscription = null;
    if (isDbConnected()) {
      [seatsUsed, ticketsThisMonth, subscription] = await Promise.all([
        User.countDocuments({ orgId: org._id || org.id, active: true }),
        Ticket.countDocuments({ orgId: org._id || org.id, createdAt: { $gte: monthStart } }),
        Subscription.findOne({ orgId: org._id || org.id }).catch(() => null),
      ]);
    } else {
      seatsUsed = memory.users.filter((u) => String(u.orgId) === String(org.id) && u.active !== false).length;
      ticketsThisMonth = memory.tickets.filter(
        (t) => String(t.orgId) === String(org.id) && new Date(t.createdAt) >= monthStart
      ).length;
      subscription = memory.subscriptions.find((s) => String(s.orgId) === String(org.id)) || null;
    }
    const limits = entitlements(plan);
    return res.json({
      organization: typeof org.toJSONSafe === "function" ? org.toJSONSafe() : org,
      plan,
      entitlements: limits,
      trial: { active: isTrialActive(org), daysLeft: trialDaysLeft(org) },
      usage: {
        seatsUsed,
        seats: org.seats,
        ticketsThisMonth,
        ticketsIncluded: limits.ticketsPerMonth,
      },
      subscription: subscription && typeof subscription.toJSONSafe === "function" ? subscription.toJSONSafe() : subscription,
    });
  })
);

// PATCH /api/org — rename workspace (admin). Plan changes arrive via
// billing in Phase 2; until then non-production may switch plans for testing.
router.patch(
  "/",
  requireRole("admin"),
  [body("name").optional().notEmpty().withMessage("Name required")],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    const { name, plan } = req.body;
    if (plan !== undefined && process.env.NODE_ENV === "production") {
      return res.status(403).json({ error: "Plan changes go through billing." });
    }
    if (plan !== undefined && !["free", "pro", "scale"].includes(plan)) {
      return res.status(400).json({ error: "Unknown plan" });
    }
    if (isDbConnected()) {
      const org = await Organization.findById(req.orgId).catch(() => null);
      if (!org) return res.status(404).json({ error: "Workspace not found" });
      if (name) org.name = String(name).slice(0, 80);
      if (plan !== undefined) {
        org.plan = plan;
        if (plan !== "free") org.status = "active";
        await Subscription.findOneAndUpdate(
          { orgId: org._id },
          { $set: { plan, status: org.status } },
          { upsert: true }
        ).catch(() => null);
      }
      await org.save();
      return res.json(org.toJSONSafe());
    }
    const org = memory.orgs.find((o) => String(o.id) === String(req.orgId));
    if (!org) return res.status(404).json({ error: "Workspace not found" });
    if (name) org.name = String(name).slice(0, 80);
    if (plan !== undefined) {
      org.plan = plan;
      if (plan !== "free") org.status = "active";
      const sub = memory.subscriptions.find((s) => String(s.orgId) === String(org.id));
      if (sub) {
        sub.plan = plan;
        sub.status = org.status;
      }
    }
    org.updatedAt = new Date();
    return res.json(org);
  })
);

export default router;
