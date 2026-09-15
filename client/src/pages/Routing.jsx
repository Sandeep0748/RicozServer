import Topbar from "../components/Topbar";
import { useDashboard } from "../api/hooks";

const rules = [
  { name: "Billing refunds → Billing queue", when: "Subject contains 'refund' OR tag = billing", action: "Assign skill: refunds · Agent: Sana K. · SLA 4h", active: true },
  { name: "VIP accounts → Senior agents", when: "Company tier = Enterprise", action: "Assign: Arjun P. · Priority: Urgent · Notify manager", active: true },
  { name: "Social DMs after hours", when: "Channel = Instagram AND hour > 18:00", action: "Auto-reply + create ticket · SLA 8h", active: true },
  { name: "API failures → Engineering", when: "Source = API AND priority = Urgent", action: "Create linked task in backlog · Page on-call", active: false },
];

export default function Routing() {
  const { data } = useDashboard();
  const policies = data?.slaPolicies || {
    Urgent: { firstResponseMins: 15, resolveHours: 2, escalate: "Escalate to manager" },
    High: { firstResponseMins: 60, resolveHours: 4, escalate: "Escalate to lead" },
    Medium: { firstResponseMins: 240, resolveHours: 24, escalate: null },
    Low: { firstResponseMins: 480, resolveHours: 48, escalate: null },
  };

  return (
    <div>
      <Topbar title="Routing & SLA" subtitle={`Intelligent service routing + escalation policies${data ? " · live SLA" : ""}`} />
      <div className="p-4 sm:p-6 grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
          <h3 className="font-bold">Assignment rules</h3>
          <p className="text-xs text-[#777] mt-1">Rule execution engine ships next — rules below are enforced at ticket creation via skill defaults.</p>
          <div className="mt-3 space-y-3">
            {rules.map(r => (
              <div key={r.name} className="rounded-xl border border-[#EFEFEF] p-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${r.active ? "bg-green-500" : "bg-gray-300"}`} />
                  <p className="font-bold">{r.name}</p>
                  <span className="ml-auto text-xs text-[#888]">{r.active ? "Active" : "Paused"}</span>
                </div>
                <p className="mt-2 text-[#555]"><span className="font-semibold">When:</span> {r.when}</p>
                <p className="mt-1 text-[#555]"><span className="font-semibold">Then:</span> {r.action}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5 text-sm">
          <h3 className="font-bold">SLA policies (live)</h3>
          <ul className="mt-3 space-y-2.5 text-[#444]">
            {Object.entries(policies).map(([name, p]) => (
              <li key={name} className="rounded-lg bg-[#F7F7F7] p-3">
                {name} → First response {p.firstResponseMins}m · Resolve {p.resolveHours}h{p.escalate ? ` · ${p.escalate}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
