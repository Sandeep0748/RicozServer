import { Ticket, Clock, Smile, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import Topbar from "../components/Topbar";
import { useDashboard } from "../api/hooks";
import { volumeByDay as fbVolume, csatTrend as fbCsat } from "../mocks/metrics";
import { tickets as fbTickets } from "../mocks/tickets";

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboard();
  const live = !!data && !isError;
  const stats = data?.stats;
  const volume = data?.volumeByDay?.length ? data.volumeByDay : fbVolume;
  const csat = data?.csatTrend?.length ? data.csatTrend : fbCsat;
  const attention = data?.needsAttention?.length ? data.needsAttention : fbTickets.slice(0, 4);

  const cards = [
    { icon: Ticket, label: "Open tickets", value: stats ? String(stats.open) : "—", sub: stats ? `${stats.pending} pending · ${stats.resolved} resolved` : "loading…" },
    { icon: Clock, label: "Avg first response", value: stats?.avgFirstResponse || "18m", sub: "-22% vs last week" },
    { icon: Smile, label: "CSAT", value: stats?.csat || "4.6 / 5", sub: stats ? `${stats.csatCount} ratings` : "" },
    { icon: AlertTriangle, label: "SLA breaches", value: stats ? String(stats.breaches) : "—", sub: "needs escalation" },
  ];

  return (
    <div>
      <Topbar title="Overview" subtitle={`Service health across channels, teams, and SLAs${live ? ` · live (${data.mode})` : " · demo data"}`} />
      <div className="p-4 sm:p-6 space-y-4">
        {isLoading && <p className="text-sm text-[#777]">Loading live metrics…</p>}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
              <div className="flex items-center gap-2 text-[13px] text-[#666] font-medium">
                <Icon className="h-4 w-4 text-[#C5002B]" /> {label}
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-[#777]">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
            <h3 className="font-bold">Ticket volume vs resolved</h3>
            <p className="text-xs text-[#777] mb-3">Last 7 days · all channels</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volume}>
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#111111" radius={[6,6,0,0]} />
                  <Bar dataKey="resolved" fill="#C5002B" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
            <h3 className="font-bold">CSAT trend</h3>
            <p className="text-xs text-[#777] mb-3">Post-resolution ratings</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={csat}>
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis domain={[3.5, 5]} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="csat" stroke="#C5002B" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
          <h3 className="font-bold">Needs attention</h3>
          <div className="mt-3 divide-y divide-[#F0F0F0]">
            {attention.map(t => (
              <div key={t.id} className="py-3 flex items-center gap-3 text-sm">
                <span className="font-mono text-xs bg-[#F4F4F4] rounded px-2 py-1">{t.id}</span>
                <span className="flex-1 truncate font-medium">{t.subject}</span>
                <span className="hidden sm:inline text-xs text-[#777]">{t.sla}</span>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${t.priority === "Urgent" ? "bg-red-100 text-red-700" : t.priority === "High" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
