// Loads the current workspace for either persistence mode.
// Centralises the mongo-vs-memory branch so entitlement checks don't repeat it.
import { isDbConnected } from "./db.js";
import Organization from "../models/Organization.js";
import { memory } from "../store/memoryStore.js";

function plainOrg(o) {
  if (!o) return null;
  if (typeof o.toJSONSafe === "function") return { ...o.toJSONSafe(), _id: o._id };
  return o;
}

export async function loadOrg(orgId) {
  if (!orgId) return null;
  if (isDbConnected()) {
    const org = await Organization.findById(orgId).catch(() => null);
    return plainOrg(org);
  }
  const org = memory.orgs.find((o) => String(o.id) === String(orgId));
  return plainOrg(org);
}
