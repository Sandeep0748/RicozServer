import jwt from "jsonwebtoken";
import { isDbConnected } from "../config/db.js";
import User from "../models/User.js";
import { memory } from "../store/memoryStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  console.warn("WARNING: JWT_SECRET is unset in production — using insecure dev fallback. Existing tokens will invalidate once you set a real secret.");
}

export function signToken(user) {
  const payload = { id: user._id ? String(user._id) : String(user.id), role: user.role };
  const orgId = user.orgId ? String(user.orgId) : null;
  if (orgId) payload.orgId = orgId;
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

// Resolve the workspace for tokens issued before orgId existed (pre-Phase-0).
async function resolveLegacyOrg(userId) {
  if (!userId) return null;
  if (isDbConnected()) {
    const user = await User.findById(userId).select("orgId").catch(() => null);
    return user?.orgId ? String(user.orgId) : null;
  }
  const user = memory.users.find((u) => String(u.id) === String(userId));
  return user?.orgId ? String(user.orgId) : null;
}

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    if (!payload.orgId) {
      payload.orgId = await resolveLegacyOrg(payload.id);
      if (!payload.orgId) {
        return res.status(401).json({ error: "Session expired. Please sign in again." });
      }
    }
    req.user = payload;
    req.orgId = payload.orgId;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}
