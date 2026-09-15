import { Router } from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import Counter from "../models/Counter.js";
import { isDbConnected } from "../config/db.js";
import { TRIAL_DAYS, PLANS } from "../config/plans.js";
import { signToken, protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import { memory } from "../store/memoryStore.js";
import { uniqueOrgSlug } from "../utils/org.js";

const router = Router();

function fail(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  return null;
}

function safe(u) {
  if (!u) return null;
  if (typeof u.toJSONSafe === "function") return u.toJSONSafe();
  const { passwordHash: _ph, ...rest } = u;
  return rest;
}

function safeOrg(o) {
  if (!o) return null;
  if (typeof o.toJSONSafe === "function") return o.toJSONSafe();
  const { ...rest } = o;
  return rest;
}

// Create a workspace + matching subscription in either persistence mode.
async function provisionOrg(workspaceName) {
  const name = String(workspaceName || "My workspace").slice(0, 80);
  const slug = await uniqueOrgSlug(name);
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 86400000);
  if (isDbConnected()) {
    const org = await Organization.create({
      name,
      slug,
      plan: "free",
      planCycle: "monthly",
      status: "trialing",
      trialEndsAt,
      seats: PLANS.free.seats,
    });
    await Subscription.create({
      orgId: org._id,
      plan: "free",
      cycle: "monthly",
      status: "trialing",
      currentPeriodEnd: trialEndsAt,
    });
    // Pre-seed this org's ticket counter so numbering starts at RC-1043
    // (an upserted $inc counter would otherwise start at RC-1).
    await Counter.findOneAndUpdate(
      { key: `ticket:${org._id}` },
      { $setOnInsert: { seq: 1042 } },
      { upsert: true }
    ).catch(() => null);
    return org;
  }
  const org = {
    id: `org-${Date.now()}`,
    name,
    slug,
    plan: "free",
    planCycle: "monthly",
    status: "trialing",
    trialEndsAt,
    seats: PLANS.free.seats,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memory.orgs.push(org);
  memory.subscriptions.push({
    id: `sub-${Date.now()}`,
    orgId: org.id,
    plan: "free",
    cycle: "monthly",
    status: "trialing",
    currentPeriodEnd: trialEndsAt,
    invoices: [],
  });
  return org;
}

async function seatTaken(orgId, seats) {
  if (isDbConnected()) {
    return (await User.countDocuments({ orgId, active: true })) >= seats;
  }
  return memory.users.filter((u) => String(u.orgId) === String(orgId) && u.active !== false).length >= seats;
}

// POST /api/auth/register — creates a NEW workspace (caller becomes its admin),
// or joins an existing one when { orgId } is supplied (invite path).
router.post(
  "/register",
  [body("name").notEmpty().withMessage("Name required"), body("email").isEmail().withMessage("Valid email required"), body("password").isLength({ min: 6 }).withMessage("Password min 6 chars")],
  asyncHandler(async (req, res) => {
    if (fail(req, res)) return;
    const { name, email, password, role, workspace, orgId: joinOrgId } = req.body;
    const cleanEmail = String(email).toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);

    if (joinOrgId) {
      if (isDbConnected()) {
        const org = await Organization.findById(joinOrgId).catch(() => null);
        if (!org) return res.status(404).json({ error: "Workspace not found" });
        if (await User.findOne({ email: cleanEmail, orgId: org._id })) {
          return res.status(409).json({ error: "Email already registered in this workspace" });
        }
        if (await seatTaken(org._id, org.seats)) {
          return res.status(402).json({ error: "Seat limit reached for this workspace. Ask an admin to upgrade.", code: "SEAT_LIMIT", plan: org.plan });
        }
        // Open route can't mint admins — workspace admins promote from Settings.
        const cleanRole = ["agent", "customer"].includes(role) ? role : "agent";
        const user = await User.create({ name, email: cleanEmail, passwordHash, role: cleanRole, orgId: org._id });
        return res.status(201).json({ token: signToken(user), user: user.toJSONSafe(), organization: org.toJSONSafe() });
      }
      const org = memory.orgs.find((o) => String(o.id) === String(joinOrgId));
      if (!org) return res.status(404).json({ error: "Workspace not found" });
      if (memory.users.some((u) => u.email === cleanEmail && String(u.orgId) === String(org.id))) {
        return res.status(409).json({ error: "Email already registered in this workspace" });
      }
      if (await seatTaken(org.id, org.seats)) {
        return res.status(402).json({ error: "Seat limit reached for this workspace. Ask an admin to upgrade.", code: "SEAT_LIMIT", plan: org.plan });
      }
      const cleanRole = ["agent", "customer"].includes(role) ? role : "agent";
      const user = { id: `u-${Date.now()}`, name, email: cleanEmail, passwordHash, role: cleanRole, active: true, orgId: org.id };
      memory.users.push(user);
      return res.status(201).json({ token: signToken({ _id: user.id, role: user.role, orgId: user.orgId }), user: safe(user), organization: safeOrg(org) });
    }

    // New workspace — the creator owns it, so they are always its admin.
    const org = await provisionOrg(workspace || `${name}'s workspace`);
    const orgKey = org._id || org.id;
    if (isDbConnected()) {
      const user = await User.create({ name, email: cleanEmail, passwordHash, role: "admin", orgId: org._id });
      return res.status(201).json({ token: signToken(user), user: user.toJSONSafe(), organization: org.toJSONSafe() });
    }
    const user = { id: `u-${Date.now()}`, name, email: cleanEmail, passwordHash, role: "admin", active: true, orgId: orgKey };
    memory.users.push(user);
    return res.status(201).json({ token: signToken({ _id: user.id, role: user.role, orgId: user.orgId }), user: safe(user), organization: safeOrg(org) });
  })
);

// POST /api/auth/login — { email, password, workspace? }.
// workspace (org slug) is required only when the email lives in several orgs.
router.post(
  "/login",
  [body("email").isEmail().withMessage("Valid email required"), body("password").notEmpty().withMessage("Password required")],
  asyncHandler(async (req, res) => {
    if (fail(req, res)) return;
    const { email, password, workspace } = req.body;
    const cleanEmail = String(email).toLowerCase();

    async function findOrgBySlug(slug) {
      if (!slug) return null;
      const s = String(slug).toLowerCase();
      if (isDbConnected()) return Organization.findOne({ slug: s }).catch(() => null);
      return memory.orgs.find((o) => o.slug === s) || null;
    }

    async function orgJson(org) {
      if (!org) return null;
      if (typeof org.toJSONSafe === "function") return org.toJSONSafe();
      return safeOrg(org);
    }

    function passwordOk(user) {
      if (user.passwordHash === "__seed__") {
        return Promise.resolve(password === (process.env.SEED_ADMIN_PASSWORD || "Admin123!"));
      }
      return bcrypt.compare(password, user.passwordHash);
    }

    if (isDbConnected()) {
      const users = await User.find({ email: cleanEmail, active: true });
      if (!users.length) return res.status(401).json({ error: "Invalid credentials" });
      let user = users[0];
      if (users.length > 1) {
        const org = await findOrgBySlug(workspace);
        user = org ? users.find((u) => String(u.orgId) === String(org._id)) : null;
        if (!user) {
          if (!org) {
            return res.status(400).json({
              error: "This email belongs to multiple workspaces. Please choose your workspace.",
              code: "WORKSPACE_REQUIRED",
            });
          }
          return res.status(401).json({ error: "Invalid credentials" });
        }
      }
      if (!(await passwordOk(user))) return res.status(401).json({ error: "Invalid credentials" });
      const org = await Organization.findById(user.orgId).catch(() => null);
      return res.json({ token: signToken(user), user: user.toJSONSafe(), organization: await orgJson(org) });
    }

    const users = memory.users.filter((u) => u.email === cleanEmail && u.active !== false);
    if (!users.length) return res.status(401).json({ error: "Invalid credentials" });
    let user = users[0];
    if (users.length > 1) {
      const org = await findOrgBySlug(workspace);
      user = org ? users.find((u) => String(u.orgId) === String(org.id)) : null;
      if (!user) {
        if (!org) {
          return res.status(400).json({
            error: "This email belongs to multiple workspaces. Please choose your workspace.",
            code: "WORKSPACE_REQUIRED",
          });
        }
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }
    if (!(await passwordOk(user))) return res.status(401).json({ error: "Invalid credentials" });
    const org = memory.orgs.find((o) => String(o.id) === String(user.orgId));
    return res.json({ token: signToken({ _id: user.id, role: user.role, orgId: user.orgId }), user: safe(user), organization: await orgJson(org) });
  })
);

// GET /api/auth/me
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    if (isDbConnected()) {
      const user = await User.findOne({ _id: req.user.id, orgId: req.orgId }).catch(() => null);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user.toJSONSafe());
    }
    const user = memory.users.find((u) => (String(u.id) === String(req.user.id)) && String(u.orgId) === String(req.orgId));
    // seed admin token may carry role only; fall back to admin profile
    if (!user) {
      if (req.user.role === "admin") return res.json({ id: "u-admin", name: "Ricoz Admin", email: "admin@ricoz.local", role: "admin", active: true, orgId: req.orgId });
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(safe(user));
  })
);

export default router;
