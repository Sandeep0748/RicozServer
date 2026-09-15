export const tickets = [
  { id: "RC-1042", subject: "Refund not reflected after cancellation", customer: "Aarav Mehta", company: "ShopKart", channel: "Email", priority: "High", status: "Open", agent: "Sana K.", sla: "2h 14m", updated: "2m ago", sentiment: "Negative" },
  { id: "RC-1041", subject: "WhatsApp order updates stopped", customer: "Elena D.", company: "Bloomly", channel: "WhatsApp", priority: "Urgent", status: "Open", agent: "Arjun P.", sla: "45m", updated: "9m ago", sentiment: "Neutral" },
  { id: "RC-1040", subject: "How to configure SLA escalation?", customer: "Tom Becker", company: "Nordwind", channel: "Chat", priority: "Medium", status: "Pending", agent: "Mira S.", sla: "6h 02m", updated: "18m ago", sentiment: "Positive" },
  { id: "RC-1039", subject: "Instagram DM: damaged item received", customer: "Priya Nair", company: "CasaHome", channel: "Instagram", priority: "High", status: "Open", agent: "Unassigned", sla: "1h 05m", updated: "31m ago", sentiment: "Negative" },
  { id: "RC-1038", subject: "Voice call dropped — billing query", customer: "James Carter", company: "FinEdge", channel: "Voice", priority: "Medium", status: "Resolved", agent: "Sana K.", sla: "Met", updated: "1h ago", sentiment: "Positive" },
  { id: "RC-1037", subject: "Knowledge base search returns old pricing", customer: "Li Wei", company: "CloudNine", channel: "Portal", priority: "Low", status: "Pending", agent: "Dev R.", sla: "12h 40m", updated: "2h ago", sentiment: "Neutral" },
  { id: "RC-1036", subject: "Bulk ticket import via API failing", customer: "Sara Ahmed", company: "LogiQ", channel: "Email", priority: "Urgent", status: "Open", agent: "Arjun P.", sla: "38m", updated: "2h ago", sentiment: "Negative" },
  { id: "RC-1035", subject: "SSO login loop for agents", customer: "Marco Rossi", company: "Veltrix", channel: "Chat", priority: "High", status: "Resolved", agent: "Mira S.", sla: "Met", updated: "5h ago", sentiment: "Positive" },
];

export const ticketDetail = {
  id: "RC-1042",
  subject: "Refund not reflected after cancellation",
  customer: "Aarav Mehta",
  company: "ShopKart",
  priority: "High",
  status: "Open",
  channel: "Email",
  created: "Sep 14, 2026 · 10:02 AM",
  sla: "Breaches in 2h 14m",
  messages: [
    { from: "customer", author: "Aarav Mehta", time: "10:02 AM", text: "Hi team, I cancelled order #88213 yesterday but the refund still shows as pending. Need this resolved before my card billing date." },
    { from: "agent", author: "Sana K.", time: "10:18 AM", text: "Hi Aarav, thanks for flagging. I can see the cancellation was processed. Checking with the payments team — will update you within 2 hours." },
    { from: "internal", author: "System · Routing", time: "10:18 AM", text: "Auto-routed to Billing queue (skill: refunds) · SLA 4h started · Sentiment: Negative" },
    { from: "customer", author: "Aarav Mehta", time: "10:41 AM", text: "Thanks — also please confirm on email once done, I don't monitor chat often." },
  ],
};
