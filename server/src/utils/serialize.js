import { slaLabel, timeAgo } from "../utils/sla.js";

export function serializeTicket(t) {
  const ticketId = t.ticketId || t.id;
  const status = t.status || "Open";
  return {
    _id: String(t._id || t.id),
    id: ticketId,
    subject: t.subject,
    description: t.description || t.subject,
    customer: t.customerName || t.customer || "",
    company: t.company || "",
    channel: t.channel,
    priority: t.priority,
    status,
    agent: t.agentName || t.agent || "Unassigned",
    sla: t.slaLabel || slaLabel(t.slaDueAt || Date.now(), status),
    slaDueAt: t.slaDueAt,
    updated: timeAgo(t.updatedAt || t.createdAt || Date.now()),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    sentiment: t.sentiment || "Neutral",
    messages: (t.messages || []).map((m) => ({
      from: m.from,
      author: m.author,
      text: m.text,
      time: m.at ? new Date(m.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "",
      at: m.at,
    })),
  };
}

export function serializeCustomer(c, ticketCount = 0) {
  return {
    _id: String(c._id || c.id),
    id: String(c._id || c.id),
    name: c.name,
    email: c.email || "",
    company: c.company || "",
    tickets: ticketCount,
    csats: c.csat != null ? String(c.csat) : "—",
    csat: c.csat,
    health: c.health || "Healthy",
    lastActive: timeAgo(c.updatedAt || c.createdAt || Date.now()),
    createdAt: c.createdAt,
  };
}

export function serializeArticle(a) {
  const total = (a.helpfulYes || 0) + (a.helpfulNo || 0);
  const pct = total ? Math.round(((a.helpfulYes || 0) / total) * 100) : 94;
  return {
    _id: String(a._id || a.id),
    id: String(a._id || a.id),
    title: a.title,
    body: a.body || "",
    category: a.category,
    views: typeof a.views === "number" ? (a.views >= 1000 ? `${(a.views / 1000).toFixed(1)}k` : String(a.views)) : a.views,
    viewsRaw: a.views,
    helpful: `${pct}%`,
    helpfulYes: a.helpfulYes || 0,
    helpfulNo: a.helpfulNo || 0,
    updated: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "",
    updatedAt: a.updatedAt,
  };
}

export function pageOf(rows, total, page, limit) {
  return { data: rows, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}
