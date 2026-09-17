// In-memory fallback store used when MONGO_URI is not set.
// Mirrors the Mongoose API shapes so the frontend contract stays identical.
import { slaDueAt } from "../utils/sla.js";

// Ticket numbers restart per workspace (RC-1043 in every new org is normal).
const seqByOrg = { "org-demo": 1043 };

const now = (minsAgo = 0) => new Date(Date.now() - minsAgo * 60000);

export const DEMO_ORG_ID = "org-demo";

export const memory = {
  orgs: [
    { id: DEMO_ORG_ID, name: "Ricoz Demo", slug: "ricoz-demo", plan: "pro", planCycle: "monthly", status: "active", seats: 25, createdAt: now(60 * 24 * 60), updatedAt: now(60) },
  ],
  subscriptions: [
    { id: "sub-demo", orgId: DEMO_ORG_ID, plan: "pro", cycle: "monthly", status: "active", currentPeriodEnd: now(-60 * 24 * 30), invoices: [] },
  ],
  users: [
    { id: "u-admin", orgId: DEMO_ORG_ID, name: "Ricoz Admin", email: "admin@ricoz.local", passwordHash: "__seed__", role: "admin", active: true },
  ],
  customers: [
    { id: "c1", orgId: DEMO_ORG_ID, name: "Aarav Mehta", company: "ShopKart", email: "aarav@shopkart.in", health: "At risk", csat: 4.2, createdAt: now(60 * 24 * 30), updatedAt: now(2) },
    { id: "c2", orgId: DEMO_ORG_ID, name: "Elena D.", company: "Bloomly", email: "elena@bloomly.co", health: "Healthy", csat: 4.8, createdAt: now(60 * 24 * 20), updatedAt: now(9) },
    { id: "c3", orgId: DEMO_ORG_ID, name: "Tom Becker", company: "Nordwind", email: "tom@nordwind.de", health: "Healthy", csat: 4.5, createdAt: now(60 * 24 * 40), updatedAt: now(18) },
    { id: "c4", orgId: DEMO_ORG_ID, name: "Priya Nair", company: "CasaHome", email: "priya@casahome.in", health: "At risk", csat: 3.9, createdAt: now(60 * 24 * 10), updatedAt: now(31) },
    { id: "c5", orgId: DEMO_ORG_ID, name: "James Carter", company: "FinEdge", email: "james@finedge.com", health: "Champion", csat: 4.9, createdAt: now(60 * 24 * 50), updatedAt: now(60) },
    { id: "c6", orgId: DEMO_ORG_ID, name: "Sara Ahmed", company: "LogiQ", email: "sara@logiq.io", health: "Healthy", csat: 4.1, createdAt: now(60 * 24 * 15), updatedAt: now(120) },
  ],
  tickets: [],
  items: [],
  invoices: [],
  estimates: [],
  recurring: [],
  expenses: [],
  projects: [],
  timeEntries: [],
  creditNotes: [],
  debitNotes: [],
  notifications: [
    { id: "n1", orgId: DEMO_ORG_ID, title: "Welcome to RicozInvoice", body: "Add your first customer to start the billing journey.", type: "info", read: false, link: "/customers", createdAt: now(60), updatedAt: now(60) },
  ],
  seq: { invoice: 1, estimate: 1, credit: 1, debit: 1 },
  articles: [
    { id: "a1", orgId: DEMO_ORG_ID, title: "How refunds are processed after cancellation", body: "Refunds are issued to the original payment method within 5-7 business days after cancellation is confirmed.", category: "Billing", views: 12400, helpfulYes: 940, helpfulNo: 60, createdAt: now(60 * 24 * 4), updatedAt: now(60 * 24 * 4) },
    { id: "a2", orgId: DEMO_ORG_ID, title: "Configuring SLA policies and escalations", body: "Go to Routing & SLA to set first-response and resolution targets per priority.", category: "Admin", views: 8100, helpfulYes: 910, helpfulNo: 90, createdAt: now(60 * 24 * 6), updatedAt: now(60 * 24 * 6) },
    { id: "a3", orgId: DEMO_ORG_ID, title: "Connecting WhatsApp Business to RicozServe", body: "Connect your WhatsApp Business number from Settings > Channels > WhatsApp.", category: "Channels", views: 15200, helpfulYes: 960, helpfulNo: 40, createdAt: now(60 * 24 * 2), updatedAt: now(60 * 24 * 2) },
    { id: "a4", orgId: DEMO_ORG_ID, title: "Skill-based routing: best practices", body: "Tag agents with skills and let urgent billing tickets route to the refunds queue.", category: "Routing", views: 6700, helpfulYes: 890, helpfulNo: 110, createdAt: now(60 * 24 * 9), updatedAt: now(60 * 24 * 9) },
    { id: "a5", orgId: DEMO_ORG_ID, title: "Using macros and canned responses", body: "Save replies your team reuses and insert them with one click.", category: "Productivity", views: 5300, helpfulYes: 930, helpfulNo: 70, createdAt: now(60 * 24 * 12), updatedAt: now(60 * 24 * 12) },
    { id: "a6", orgId: DEMO_ORG_ID, title: "Understanding customer journey analytics", body: "Track request to CSAT funnel to find where tickets stall.", category: "Reports", views: 4900, helpfulYes: 900, helpfulNo: 100, createdAt: now(60 * 24 * 15), updatedAt: now(60 * 24 * 15) },
  ],
};

const seedTickets = [
  ["RC-1042", "Refund not reflected after cancellation", "c1", "Email", "High", "Open", "Sana K.", "Negative", 2, "2h 14m"],
  ["RC-1041", "WhatsApp order updates stopped", "c2", "WhatsApp", "Urgent", "Open", "Arjun P.", "Neutral", 9, "45m"],
  ["RC-1040", "How to configure SLA escalation?", "c3", "Chat", "Medium", "Pending", "Mira S.", "Positive", 18, "6h 02m"],
  ["RC-1039", "Instagram DM: damaged item received", "c4", "Instagram", "High", "Open", "Unassigned", "Negative", 31, "1h 05m"],
  ["RC-1038", "Voice call dropped — billing query", "c5", "Voice", "Medium", "Resolved", "Sana K.", "Positive", 60, "Met"],
  ["RC-1037", "Knowledge base search returns old pricing", "c3", "Portal", "Low", "Pending", "Dev R.", "Neutral", 120, "12h 40m"],
  ["RC-1036", "Bulk ticket import via API failing", "c6", "Email", "Urgent", "Open", "Arjun P.", "Negative", 130, "38m"],
  ["RC-1035", "SSO login loop for agents", "c3", "Chat", "High", "Resolved", "Mira S.", "Positive", 300, "Met"],
];

function cust(id) {
  return memory.customers.find((c) => c.id === id);
}

memory.tickets = seedTickets.map(([ticketId, subject, cid, channel, priority, status, agentName, sentiment, minsAgo, _sla], i) => {
  const c = cust(cid);
  const createdAt = now(minsAgo + 30);
  return {
    id: `t${i + 1}`,
    orgId: c.orgId || DEMO_ORG_ID,
    ticketId,
    subject,
    description: subject,
    customer: c.id,
    customerName: c.name,
    company: c.company,
    channel,
    priority,
    status,
    agentName,
    slaDueAt: slaDueAt(priority, createdAt),
    sentiment,
    messages: [
      { from: "customer", author: c.name, text: `${subject} — please help urgently.`, at: createdAt },
      { from: "system", author: "System · Routing", text: `Auto-routed · SLA started · Sentiment: ${sentiment}`, at: createdAt },
    ],
    createdAt,
    updatedAt: now(minsAgo),
  };
});

// First ticket gets the rich thread from the prototype
memory.tickets[0].messages = [
  { from: "customer", author: "Aarav Mehta", text: "Hi team, I cancelled order #88213 yesterday but the refund still shows as pending. Need this resolved before my card billing date.", at: now(360) },
  { from: "agent", author: "Sana K.", text: "Hi Aarav, thanks for flagging. I can see the cancellation was processed. Checking with the payments team — will update you within 2 hours.", at: now(344) },
  { from: "internal", author: "System · Routing", text: "Auto-routed to Billing queue (skill: refunds) · SLA 4h started · Sentiment: Negative", at: now(344) },
  { from: "customer", author: "Aarav Mehta", text: "Thanks — also please confirm on email once done, I don't monitor chat often.", at: now(321) },
];

export function nextMemoryTicketId(orgId) {
  const key = orgId ? String(orgId) : DEMO_ORG_ID;
  if (!seqByOrg[key]) seqByOrg[key] = 1043;
  return `RC-${seqByOrg[key]++}`;
}
