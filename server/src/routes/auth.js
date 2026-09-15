import { Router } from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { isDbConnected } from "../config/db.js";
import { signToken, protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import { memory } from "../store/memoryStore.js";

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

// POST /api/auth/register
router.post(
  "/register",
  [body("name").notEmpty().withMessage("Name required"), body("email").isEmail().withMessage("Valid email required"), body("password").isLength({ min: 6 }).withMessage("Password min 6 chars")],
  asyncHandler(async (req, res) => {
    if (fail(req, res)) return;
    const { name, email, password, role } = req.body;
    const cleanRole = ["admin", "agent", "customer"].includes(role) ? role : "agent";

    if (isDbConnected()) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ error: "Email already registered" });
      // Prevent open admin creation after first user exists
      if (cleanRole === "admin") {
        const count = await User.countDocuments();
        if (count > 0) return res.status(403).json({ error: "Admin creation requires an admin invite" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: cleanRole });
      return res.status(201).json({ token: signToken(user), user: user.toJSONSafe() });
    }

    // memory mode
    const exists = memory.users.find((u) => u.email === String(email).toLowerCase());
    if (exists) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: `u-${Date.now()}`, name, email: String(email).toLowerCase(), passwordHash, role: cleanRole, active: true };
    memory.users.push(user);
    return res.status(201).json({ token: signToken({ _id: user.id, role: user.role }), user: safe(user) });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  [body("email").isEmail().withMessage("Valid email required"), body("password").notEmpty().withMessage("Password required")],
  asyncHandler(async (req, res) => {
    if (fail(req, res)) return;
    const { email, password } = req.body;

    // Seed admin shortcut works in both modes (also seeded via seed.js for mongo)
    if (isDbConnected()) {
      const user = await User.findOne({ email: String(email).toLowerCase(), active: true });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });
      return res.json({ token: signToken(user), user: user.toJSONSafe() });
    }

    const user = memory.users.find((u) => u.email === String(email).toLowerCase());
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (user.passwordHash === "__seed__") {
      // default seed admin password
      if (password !== (process.env.SEED_ADMIN_PASSWORD || "Admin123!")) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    }
    return res.json({ token: signToken({ _id: user.id, role: user.role }), user: safe(user) });
  })
);

// GET /api/auth/me
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    if (isDbConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user.toJSONSafe());
    }
    const user = memory.users.find((u) => u.id === req.user.id || String(u.id) === String(req.user.id));
    // seed admin token may carry role only; fall back to admin profile
    if (!user) {
      if (req.user.role === "admin") return res.json({ id: "u-admin", name: "Ricoz Admin", email: "admin@ricoz.local", role: "admin", active: true });
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(safe(user));
  })
);

export default router;
