import Organization from "../models/Organization.js";
import { memory } from "../store/memoryStore.js";
import { isDbConnected } from "../config/db.js";

export function slugify(text) {
  return (
    String(text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "workspace"
  );
}

async function slugTaken(slug) {
  if (isDbConnected()) {
    return !!(await Organization.findOne({ slug }).select("_id").catch(() => null));
  }
  return memory.orgs.some((o) => o.slug === slug);
}

// "acme" -> "acme-2" -> "acme-3" ... until free. Races are harmless:
// slug has a unique index, the loser retries via the route's 409 path.
export async function uniqueOrgSlug(base) {
  const root = slugify(base);
  let slug = root;
  for (let n = 2; await slugTaken(slug); n += 1) {
    slug = `${root}-${n}`.slice(0, 48);
  }
  return slug;
}
