import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import Topbar from "../components/Topbar";
import { useDashboard } from "../api/hooks";
import { channelSplit as fbSplit, journeyFunnel as fbFunnel } from "../mocks/metrics";

const COLORS = ["#111111", "#C5002B", "#E36A00", "#6A5BFF", "#00A06A"];

export default function Analytics() {
  const { data } = useDashboard();
  const split = data?.channelSplit?.length ? data.channelSplit : fbSplit;
  const funnel = data?.journeyFunnel?.length ? data.journeyFunnel : fbFunnel;

  return (
    <div>
      <Topbar title="Analytics" subtitle={`Customer journey analytics + operational reports${data ? ` · live (${data.mode})` : ""}`} />
      <div className="p-4 sm:p-6 grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
          <h3 className="font-bold">Tickets by channel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={split} dataKey="value" nameKey="name" outerRadius={90} label>
                  {split.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
          <h3 className="font-bold">Customer journey funnel</h3>
          <p className="text-xs text-[#777] mb-3">Request → CSAT</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical">
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="stage" fontSize={12} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#C5002B" radius={[0,8,8,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
