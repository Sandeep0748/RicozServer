// Plan catalog + entitlement checks. Single source of truth for packaging:
// the landing pricing table, the /api/plans endpoint, and server enforcement
// all read from here so a tier change never drifts between marketing and gates.

export const TRIAL_DAYS = 14;

export const PLANS = {
  free: {
    name: "Starter",
    monthlyINR: 0,
    annualINR: 0,
    seats: 2,
    ticketsPerMonth: 100,
    channels: ["Email", "Portal"],
    analytics: false,
    slaPolicies: false,
    customDomain: false,
    ai: false,
    api: false,
    whiteLabel: false,
  },
  pro: {
    name: "Pro",
    monthlyINR: 499,
    annualINR: 4790, // ~20% off, UPI-friendly round figure
    seats: 25,
    ticketsPerMonth: 1000,
    channels: ["Email", "Chat", "Voice", "WhatsApp", "Social", "Instagram", "Portal"],
    analytics: true,
    slaPolicies: true,
    customDomain: false,
    ai: false,
    api: true,
    whiteLabel: false,
  },
  scale: {
    name: "Scale",
    monthlyINR: 999,
    annualINR: 9590,
    seats: -1, // unlimited
    ticketsPerMonth: -1, // unlimited
    channels: ["Email", "Chat", "Voice", "WhatsApp", "Social", "Instagram", "Portal"],
    analytics: true,
    slaPolicies: true,
    customDomain: true,
    ai: true,
    api: true,
    whiteLabel: true,
  },
};

export function entitlements(plan) {
  return PLANS[plan] || PLANS.free;
}

export function isTrialActive(org) {
  return !!org && org.status === "trialing" && !!org.trialEndsAt && new Date(org.trialEndsAt) > new Date();
}

// Trials unlock Pro *features* (analytics, channels, limits) but never extra seats.
export function effectivePlan(org) {
  if (!org) return "free";
  if (isTrialActive(org)) return "pro";
  return org.plan || "free";
}

export function trialDaysLeft(org) {
  if (!isTrialActive(org)) return 0;
  return Math.max(0, Math.ceil((new Date(org.trialEndsAt) - new Date()) / 86400000));
}

// Express middleware: blocks with 402 + machine-readable code the client
// turns into an upgrade prompt. `flag` is a boolean entitlement key
// (analytics, ai, api, customDomain, whiteLabel...).
export function requireEntitlement(flag) {
  return async (req, res, next) => {
    try {
      const { loadOrg } = await import("./orgLoader.js");
      const org = await loadOrg(req.orgId);
      if (!org) return res.status(404).json({ error: "Workspace not found" });
      if (org.status === "suspended") {
        return res.status(403).json({ error: "Workspace suspended. Contact support.", code: "SUSPENDED" });
      }
      const plan = effectivePlan(org);
      if (!entitlements(plan)[flag]) {
        return res.status(402).json({
          error: `This feature needs the ${PLANS[plan === "free" ? "pro" : "scale"].name} plan.`,
          code: "UPGRADE_REQUIRED",
          feature: flag,
          plan,
        });
      }
      req.org = org;
      next();
    } catch (e) {
      next(e);
    }
  };
}
