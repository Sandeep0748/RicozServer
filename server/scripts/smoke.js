// Minimal smoke test: exercises health, multi-tenant register/login,
// cross-workspace isolation, seat limits, tickets, kb, dashboard.
const BASE = process.env.API_URL || "http://localhost:5000";

async function req(path, opts = {}) {
  const { headers = {}, ...rest } = opts;
  const res = await fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", ...headers }, ...rest });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function decodePayload(token) {
  try {
    return JSON.parse(Buffer.from(String(token).split(".")[1], "base64").toString());
  } catch {
    return {};
  }
}

const stamp = Date.now();
const emailA = `smokeA+${stamp}@ricoz.local`;
const emailB = `smokeB+${stamp}@ricoz.local`;
let tokenA = "";
let orgA = null;

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const health = await req("/api/health");
check("health", health.status === 200 && health.body.ok, JSON.stringify(health.body));

const plans = await req("/api/plans");
check("plans catalog", plans.status === 200 && !!plans.body.plans?.free, `status=${plans.status}`);

// New signup provisions a workspace (free plan + trial) and makes them admin.
const regA = await req("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "Smoke A", email: emailA, password: "Smoke123!", workspace: "Smoke Org A" }) });
check("register provisions org", [200, 201].includes(regA.status) && !!regA.body.token && !!regA.body.organization?.slug, `status=${regA.status}`);
tokenA = regA.body.token || "";
orgA = regA.body.organization || null;
check("creator is admin", regA.body.user?.role === "admin" && !!regA.body.user?.orgId, regA.body.user?.role);
check("token carries orgId", decodePayload(tokenA).orgId === String(orgA?.id || ""), `org=${orgA?.slug}`);

// Same email can register in a second workspace (uniqueness is per-org).
const regB = await req("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "Smoke B", email: emailA, password: "Smoke123!", workspace: "Smoke Org B" }) });
check("same email, second org", [200, 201].includes(regB.status) && regB.body.organization?.slug !== orgA?.slug, `status=${regB.status}`);
const tokenB = regB.body.token || "";

// Ambiguous login without workspace asks for it; with slug it works.
const amb = await req("/api/auth/login", { method: "POST", body: JSON.stringify({ email: emailA, password: "Smoke123!" }) });
check("ambiguous login asks workspace", amb.status === 400 && amb.body.code === "WORKSPACE_REQUIRED", `status=${amb.status}`);
const loginA = await req("/api/auth/login", { method: "POST", body: JSON.stringify({ email: emailA, password: "Smoke123!", workspace: orgA?.slug }) });
check("login with workspace", loginA.status === 200 && !!loginA.body.token, `status=${loginA.status}`);

// Free plan has 2 seats: creator + 1 join OK, next join hits the paywall.
const join1 = await req("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "Seat Two", email: emailB, password: "Smoke123!", orgId: orgA?.id }) });
check("join within seats", [200, 201].includes(join1.status), `status=${join1.status}`);
const join2 = await req("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "Seat Three", email: `smokeC+${stamp}@ricoz.local`, password: "Smoke123!", orgId: orgA?.id }) });
check("seat limit enforced", join2.status === 402 && join2.body.code === "SEAT_LIMIT", `status=${join2.status}`);

if (!tokenA) {
  const login = await req("/api/auth/login", { method: "POST", body: JSON.stringify({ email: "admin@ricoz.local", password: process.env.SEED_ADMIN_PASSWORD || "Admin123!" }) });
  check("admin login", login.status === 200 && !!login.body.token, `status=${login.status}`);
  tokenA = login.body.token || "";
}

const H = { Authorization: `Bearer ${tokenA}` };
const me = await req("/api/auth/me", { headers: H });
check("me", me.status === 200 && !!me.body.email && !!me.body.orgId, `status=${me.status}`);

const org = await req("/api/org", { headers: H });
check("org overview", org.status === 200 && !!org.body.entitlements && typeof org.body.usage?.seatsUsed === "number", `status=${org.status}`);

const created = await req("/api/tickets", { method: "POST", headers: H, body: JSON.stringify({ subject: "Smoke test ticket", description: "created by smoke.js", customerName: "Smoke User", company: "QA", priority: "High" }) });
check("create ticket", created.status === 201 && !!created.body.id, `status=${created.status}`);
const tid = created.body.id;

// Cross-workspace isolation: org B must not see org A's ticket.
const HB = { Authorization: `Bearer ${tokenB}` };
const leak = await req(`/api/tickets/${tid}`, { headers: HB });
check("cross-org ticket hidden", leak.status === 404, `status=${leak.status}`);
const leakList = await req("/api/tickets?search=Smoke%20test%20ticket", { headers: HB });
check("cross-org list hidden", leakList.status === 200 && !(leakList.body.data || []).some((t) => t.id === tid), `status=${leakList.status}`);

if (tid) {
  const reply = await req(`/api/tickets/${tid}/replies`, { method: "POST", headers: H, body: JSON.stringify({ text: "Smoke reply", author: "Smoke" }) });
  check("reply", reply.status === 201, `status=${reply.status}`);
  const patch = await req(`/api/tickets/${tid}`, { method: "PATCH", headers: H, body: JSON.stringify({ status: "Resolved" }) });
  check("resolve", patch.status === 200 && patch.body.status === "Resolved", `status=${patch.status}`);
}

const kb = await req("/api/kb?q=refund", { headers: H });
check("kb search", kb.status === 200 && Array.isArray(kb.body.data), `status=${kb.status}`);

const dash = await req("/api/dashboard/summary", { headers: H });
check("dashboard", dash.status === 200 && !!dash.body.stats, `status=${dash.status}`);

const failed = checks.filter((c) => !c.ok);
process.exit(failed.length ? 1 : 0);
