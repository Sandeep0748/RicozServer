import { Link } from "react-router-dom";
import { BadgeIndianRupee, ReceiptText, Wallet, TriangleAlert, FilePlus2, FileCheck2, UserPlus, ArrowUpRight } from "lucide-react";
import { useOverview } from "../api/billing";
import { PageHeader, StatCard, Card, ViewAll, EmptyState } from "../components/workspace/ui";
import { paiseToINR, paiseToFixed } from "../utils/money";
import { emptyOverview } from "../mocks/billing";

export default function Overview() {
  const { data, isLoading } = useOverview();
  const ov = data || emptyOverview;
  const c = ov.cards || emptyOverview.cards;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[240px]">
          <PageHeader eyebrow="Overview" title="Financial overview" sub="Track what is billed, collected, spent, and still outstanding." />
        </div>
        <div className="flex items-center gap-2 pb-5">
          <span className="rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-semibold">📅 This month</span>
        </div>
      </div>

      <p className="text-[13px] text-[#6B7280] mb-3">This month</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total billed" value={paiseToINR(c.billed)} sub={`${c.billedCount || 0} invoices in this period`} accent="#111827" icon={BadgeIndianRupee} />
        <StatCard label="Collected" value={paiseToINR(c.collected)} sub={`${c.paidCount || 0} paid invoices`} accent="#16A34A" icon={ReceiptText} />
        <StatCard label="Outstanding" value={paiseToINR(c.outstanding)} sub={`${c.openCount || 0} open · ${paiseToINR(c.overdue)} overdue`} accent="#C4122F" icon={Wallet} />
        <StatCard label="Expenses" value={paiseToINR(c.spent)} sub={c.spent ? "Spent this period" : "No overdue balance"} accent="#F59E0B" icon={TriangleAlert} />
      </div>

      <div className="mt-4 grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <Card className="p-6 min-h-[280px]">
          <h3 className="font-bold">Cash flow</h3>
          <p className="text-[12.5px] text-[#8A8FA3]">Billed, collected, and spent during this period</p>
          {(ov.cashFlow || []).some((x) => x.billed || x.spent) ? (
            <div className="mt-5 flex items-end gap-3 h-40">
              {(ov.cashFlow || []).map((m) => (
                <div key={m.month} className="flex-1 text-center">
                  <div className="flex items-end justify-center gap-1 h-28">
                    <span title={`Billed ${m.billed}`} className="w-4 rounded-t bg-[#111827]" style={{ height: `${Math.min(100, m.billed / 10 + 4)}%` }} />
                    <span title={`Collected ${m.collected}`} className="w-4 rounded-t bg-[#16A34A]" style={{ height: `${Math.min(100, m.collected / 10 + 4)}%` }} />
                    <span title={`Spent ${m.spent}`} className="w-4 rounded-t bg-[#F59E0B]" style={{ height: `${Math.min(100, m.spent / 10 + 4)}%` }} />
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-[#6B7280]">{m.month}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center">
              <p className="font-bold">No financial activity yet</p>
              <p className="mt-1 text-[13px] text-[#8A8FA3]">Invoices, payments, and expenses will appear here.</p>
              {!isLoading && <Link to="/customers" className="mt-4 inline-block rounded-xl bg-[#C4122F] text-white text-sm font-semibold px-5 py-2.5">Start: add your first customer</Link>}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-bold">Quick actions</h3>
          <p className="text-[12.5px] text-[#8A8FA3]">Common workspace tasks</p>
          <div className="mt-4 space-y-2.5">
            {[
              [FilePlus2, "New invoice", "/invoices?action=new"],
              [FileCheck2, "New estimate", "/estimates?action=new"],
              [UserPlus, "Add customer", "/customers?action=new"],
              [Wallet, "Log expense", "/expenses?action=new"],
            ].map(([Icon, label, to]) => (
              <Link key={label} to={to} className="flex items-center gap-3 rounded-xl bg-[#F6F7F9] hover:bg-[#EEF0F3] px-4 py-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white shadow-sm"><Icon className="h-4 w-4 text-[#C4122F]" /></span>
                <span className="flex-1 text-[13.5px] font-bold">{label}</span>
                <ArrowUpRight className="h-4 w-4 text-[#9AA3B0]" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between"><h3 className="font-bold">Recent invoices</h3><ViewAll to="/invoices" /></div>
          <p className="text-[12px] text-[#8A8FA3]">Latest billing activity</p>
          <div className="mt-3 text-[13px]">
            {(ov.recentInvoices || []).length ? ov.recentInvoices.map((i) => (
              <Link key={i._id} to={`/invoices/${i._id}`} className="flex items-center justify-between py-2 border-t border-[#F3F4F6]">
                <span className="font-semibold">{i.number} · {i.customerName}</span>
                <span className="font-bold">{paiseToINR(i.total)}</span>
              </Link>
            )) : <EmptyState title="No invoices in this period." sub="" />}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><h3 className="font-bold">Recent payments</h3><ViewAll to="/invoices" /></div>
          <p className="text-[12px] text-[#8A8FA3]">Latest cash received</p>
          <div className="mt-3 text-[13px]">
            {(ov.recentPayments || []).length ? ov.recentPayments.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-t border-[#F3F4F6]">
                <span>{p.invoiceNumber} · {p.customerName}</span>
                <span className="font-bold text-[#16A34A]">{paiseToFixed(p.amount)}</span>
              </div>
            )) : <p className="py-8 text-center text-[13px] text-[#9AA3B0]">No payments received yet.</p>}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><h3 className="font-bold">Receivables aging</h3><ViewAll to="/reports" /></div>
          <p className="text-[12px] text-[#8A8FA3]">Outstanding balance by age</p>
          {c.outstanding > 0 ? (
            <div className="mt-3 space-y-2 text-[13px]">
              {Object.entries(ov.aging || {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between"><span>{k} days</span><span className="font-bold">{paiseToINR(v)}</span></div>
              ))}
            </div>
          ) : <p className="py-8 text-center text-[13px] text-[#9AA3B0]">No outstanding receivables.</p>}
        </Card>
      </div>
    </div>
  );
}
