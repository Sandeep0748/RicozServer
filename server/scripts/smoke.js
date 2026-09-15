// Minimal smoke test: exercises health, register/login, tickets, kb, dashboard.
const BASE = process.env.API_URL || "http://localhost:5000";

async function req(path, opts = {}) {
  const { headers = {}, ...rest } = opts;
  const res = await fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", ...headers }, ...rest });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

const email = `smoke+${Date.now()}@ricoz.local`;
let token = "";

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const health = await req("/api/health");
check("health", health.status === 200 && health.body.ok, JSON.stringify(health.body));

const reg = await req("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "Smoke", email, password: "Smoke123!" }) });
check("register", [200, 201].includes(reg.status) && !!reg.body.token, `status=${reg.status}`);
token = reg.body.token || "";

if (!token) {
  const login = await req("/api/auth/login", { method: "POST", body: JSON.stringify({ email: "admin@ricoz.local", password: process.env.SEED_ADMIN_PASSWORD || "Admin123!" }) });
  check("admin login", login.status === 200 && !!login.body.token, `status=${login.status}`);
  token = login.body.token || "";
}

const H = { Authorization: `Bearer ${token}` };
const me = await req("/api/auth/me", { headers: H });
check("me", me.status === 200 && !!me.body.email, `status=${me.status}`);

const list = await req("/api/tickets?limit=5", { headers: H });
check("list tickets", list.status === 200 && Array.isArray(list.body.data), `status=${list.status}`);

const created = await req("/api/tickets", { method: "POST", headers: H, body: JSON.stringify({ subject: "Smoke test ticket", description: "created by smoke.js", customerName: "Smoke User", company: "QA", priority: "High" }) });
check("create ticket", created.status === 201 && !!created.body.id, `status=${created.status}`);
const tid = created.body.id;

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
