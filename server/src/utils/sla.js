// SLA policy: first response + resolve targets per priority.
export const SLA_POLICIES = {
  Urgent: { firstResponseMins: 15, resolveHours: 2, escalate: "Escalate to manager" },
  High: { firstResponseMins: 60, resolveHours: 4, escalate: "Escalate to lead" },
  Medium: { firstResponseMins: 240, resolveHours: 24, escalate: null },
  Low: { firstResponseMins: 480, resolveHours: 48, escalate: null },
};

export function slaDueAt(priority, from = new Date()) {
  const policy = SLA_POLICIES[priority] || SLA_POLICIES.Medium;
  return new Date(new Date(from).getTime() + policy.resolveHours * 3600 * 1000);
}

export function slaLabel(dueAt, status) {
  if (status === "Resolved" || status === "Closed") return "Met";
  const ms = new Date(dueAt).getTime() - Date.now();
  if (ms <= 0) return "Breached";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h <= 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
