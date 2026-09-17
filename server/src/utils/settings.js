import { isDbConnected } from "../config/db.js";
import Organization from "../models/Organization.js";
import { memory } from "../store/memoryStore.js";

export const DEFAULT_SETTINGS = {
  business: {
    name: "",
    logoUrl: "",
    email: "",
    phone: "",
    website: "",
    businessType: "",
    gstin: "",
    pan: "",
    currency: "INR",
    timezone: "UTC",
    dateFormat: "DD-MM-YYYY",
  },
  invoice: {
    currency: "INR",
    paymentTerms: "Net 30",
    prefix: "INV",
    startNumber: 1,
    defaultTax: 18,
    notes: "",
    terms: "",
  },
  taxes: [{ name: "GST", rate: 18 }],
  paymentMethods: ["UPI", "Card", "Netbanking", "Cash"],
  notifications: {
    invoiceSent: true,
    paymentReceived: true,
    invoiceOverdue: true,
    teamActivity: true,
  },
};

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

// Deep-merge stored settings over defaults so older workspaces
// (and memory seeds) always expose the full shape.
export function mergeSettings(stored) {
  const out = clone(DEFAULT_SETTINGS);
  if (!stored || typeof stored !== "object") return out;
  for (const section of Object.keys(out)) {
    const v = stored[section];
    if (v === undefined || v === null) continue;
    if (Array.isArray(out[section])) {
      if (Array.isArray(v)) out[section] = v;
      continue;
    }
    if (typeof out[section] === "object" && typeof v === "object" && !Array.isArray(v)) {
      out[section] = { ...out[section], ...v };
      continue;
    }
    out[section] = v;
  }
  return out;
}

function plainOrg(org) {
  if (!org) return null;
  if (typeof org.toObject === "function") return org.toObject();
  return org;
}

export async function getOrgSettings(orgId) {
  if (isDbConnected()) {
    const org = await Organization.findById(orgId).catch(() => null);
    return mergeSettings(plainOrg(org)?.settings);
  }
  const org = memory.orgs.find((o) => String(o.id) === String(orgId));
  return mergeSettings(org?.settings);
}

export async function saveOrgSettingsSection(orgId, section, data) {
  const current = await getOrgSettings(orgId);
  if (!(section in current)) throw new Error("Unknown settings section");
  current[section] = data;
  const merged = mergeSettings(current);
  if (isDbConnected()) {
    const org = await Organization.findById(orgId);
    if (!org) throw new Error("Workspace not found", { cause: 404 });
    org.settings = merged;
    org.markModified?.("settings");
    await org.save();
    return merged;
  }
  const org = memory.orgs.find((o) => String(o.id) === String(orgId));
  if (!org) {
    const err = new Error("Workspace not found");
    err.status = 404;
    throw err;
  }
  org.settings = merged;
  org.updatedAt = new Date();
  return merged;
}

// Next document number honoring the workspace prefix + starting number.
export function nextDocNumber(prefix, startNumber, existingCount) {
  const start = Math.max(1, parseInt(startNumber, 10) || 1);
  const seq = Math.max(existingCount + 1, start);
  const p = String(prefix || "INV").trim() || "INV";
  return `${p}-${String(seq).padStart(4, "0")}`;
}
