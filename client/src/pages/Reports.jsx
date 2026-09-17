import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { useReports, useCustomersQ } from "../api/billing";
import { PageHeader, Card } from "../components/workspace/ui";
import { paiseToFixed } from "../utils/money";

const TABS = ["Overview", "Revenue", "Sales", "Invoices", "Payments", "Expenses", "Receivables", "Tax"];

export default function Reports() {
  const [tab, setTab] = useState("Overview");
  const [from, setFrom] = useState("2026-08-31");
  const [to, setTo] = useState("2026-09-17");
  const [customer, setCustomer] = useState("");
  const { data } = useReports({ from, to, customer: customer || undefined, type: tab.toLowerCase() });
  const { data: custData } = useCustomersQ({ limit: 100 });
  const s = data?.summary || { total: 0, count: 0, paid: 0, outstanding: 0, spent: 0 };
  const trend = data?.revenueTrend || [];

  return (
    <div>
      <PageHeader title="Reports" sub="Understand sales, payments, expenses, receivables, and taxes from one reporting hub." />
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-[13.5px] font-semibold border ${tab === t ? "bg-[#C4122F] text-white border-[#C4122F]" : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F6F7F9]"}`}>
            {t}
          </button>
        ))}
      </div>

      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-[14px] flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#C4122F]" /> Report filters</h3>
          <span className="ml-auto flex gap-2 text-[12.5px] font-semibold">
            <button onClick={() => setTab("Overview")} className="rounded-lg border border-[#E2E8F0] px-3 py-1.5">30 days</button>
            <button className="rounded-lg border border-[#E2E8F0] px-3 py-1.5">This month</button>
            <button className="rounded-lg border border-[#E2E8F0] px-3 py-1.5">90 days</button>
          </span>
        </div>
        <div className="mt-3 grid sm:grid-cols-3 gap-3 text-[13px]">
          <label className="block font-semibold text-[#475569]">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 font-normal" /></label>
          <label className="block font-semibold text-[#475569]">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 font-normal" /></label>
          <label className="block font-semibold text-[#475569]">Customer
            <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 font-normal">
              <option value="">Select customer</option>
              {(custData?.data || []).map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h3 className="font-bold text-[16px]">{tab} report</h3>
        <p className="text-[12.5px] text-[#8A8FA3]">Aggregated from organization-scoped financial data</p>
        <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-[#ECECF0] bg-[#FAFAFB] p-5"><p className="text-[11px] font-bold tracking-[0.08em] text-[#8A8FA3]">TOTAL</p><p className="mt-2 text-[22px] font-extrabold">{paiseToFixed(s.total)}</p></div>
          <div className="rounded-2xl border border-[#ECECF0] bg-[#FAFAFB] p-5"><p className="text-[11px] font-bold tracking-[0.08em] text-[#8A8FA3]">COUNT</p><p className="mt-2 text-[22px] font-extrabold">{s.count}</p></div>
          <div className="rounded-2xl border border-[#ECECF0] bg-[#FAFAFB] p-5"><p className="text-[11px] font-bold tracking-[0.08em] text-[#8A8FA3]">PAID / COLLECTED</p><p className="mt-2 text-[22px] font-extrabold">{paiseToFixed(s.paid)}</p></div>
          <div className="rounded-2xl border border-[#ECECF0] bg-[#FAFAFB] p-5"><p className="text-[11px] font-bold tracking-[0.08em] text-[#8A8FA3]">OUTSTANDING</p><p className="mt-2 text-[22px] font-extrabold">{paiseToFixed(s.outstanding)}</p></div>
        </div>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#ECECF0] p-5">
            <h4 className="font-bold">Revenue trend</h4>
            <p className="text-[12px] text-[#8A8FA3]">Invoice totals for the selected period</p>
            {trend.length ? (
              <div className="mt-3 flex items-end gap-1.5 h-28">
                {trend.slice(-14).map((d) => (
                  <span key={d.date} title={`${d.date}: ₹${d.total}`} className="flex-1 rounded-t bg-[#111827]" style={{ height: `${Math.min(100, d.total / 50 + 6)}%` }} />
                ))}
              </div>
            ) : <p className="mt-3 text-[13.5px] text-[#6B7280]">No data available for this period.</p>}
          </div>
          <div className="rounded-2xl border border-[#ECECF0] p-5">
            <h4 className="font-bold">Expense trend</h4>
            <p className="text-[12px] text-[#8A8FA3]">Expense totals for the selected period</p>
            <p className="mt-3 text-[13.5px] text-[#6B7280]">{s.spent ? `Spent ${paiseToFixed(s.spent)} (billable ${paiseToFixed(s.billable || 0)})` : "No data available for this period."}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
