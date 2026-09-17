import { useState } from "react";
import { Repeat, Search } from "lucide-react";
import { useRecurring, useCreateRecurring, useCustomersQ } from "../api/billing";
import { PageHeader, Card, EmptyState, Field, inputCls, btnPrimary } from "../components/workspace/ui";

export default function Recurring() {
  const [q, setQ] = useState("");
  const { data } = useRecurring({ search: q || undefined });
  const rows = data?.data || [];
  const { data: custData } = useCustomersQ({ limit: 100 });
  const create = useCreateRecurring();
  const [form, setForm] = useState({ customer: "", frequency: "monthly", startDate: "", nextRunDate: "", paymentTerms: "Net 30", discount: "" });
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const cust = (custData?.data || []).find((c) => c.name === form.customer);
      await create.mutateAsync({ ...form, customerName: cust?.name, discount: Number(form.discount) || 0 });
      setMsg("Recurring schedule saved — invoices will generate on the next run date.");
      setForm({ customer: "", frequency: "monthly", startDate: "", nextRunDate: "", paymentTerms: "Net 30", discount: "" });
    } catch (err) { setMsg(err?.response?.data?.error || "Could not save."); }
  }

  return (
    <div>
      <PageHeader eyebrow="Workspace / Recurring invoices" title="Recurring invoices" sub="Automate repeat billing and keep every scheduled invoice visible." />
      <div className="grid lg:grid-cols-[380px_1fr] gap-4 items-start">
        <Card className="p-6">
          <h2 className="font-bold text-[17px]">Add recurring invoice</h2>
          <p className="text-[12.5px] text-[#8A8FA3]">Your organization owns and controls these records.</p>
          <form onSubmit={submit} className="mt-4 space-y-3.5">
            <Field label="Customer">
              <select value={form.customer} onChange={set("customer")} className={inputCls}>
                <option value="">Select customer</option>
                {(custData?.data || []).map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Frequency">
              <select value={form.frequency} onChange={set("frequency")} className={inputCls}>
                <option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option><option value="yearly">Yearly</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date"><input type="date" value={form.startDate} onChange={set("startDate")} className={inputCls} /></Field>
              <Field label="Next run date"><input type="date" value={form.nextRunDate} onChange={set("nextRunDate")} className={inputCls} /></Field>
            </div>
            <Field label="Payment terms">
              <select value={form.paymentTerms} onChange={set("paymentTerms")} className={inputCls}>
                <option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Due on receipt</option>
              </select>
            </Field>
            <Field label="Discount (minor units)"><input value={form.discount} onChange={set("discount")} placeholder="0" className={inputCls} /></Field>
            <button className={`${btnPrimary} w-full`}>Save schedule</button>
            {msg && <p className="text-[13px] font-medium">{msg}</p>}
          </form>
        </Card>

        <Card>
          <div className="p-5 border-b border-[#F0F0F3] flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <h2 className="font-bold text-[17px]">Recurring invoices <span className="text-[#9AA3B0]">{data?.total || 0}</span></h2>
              <p className="text-[12.5px] text-[#8A8FA3]">Review and manage organization records.</p>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm w-64">
              <Search className="h-4 w-4 text-[#9AA3B0]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recurring invoices" className="outline-none w-full bg-transparent" />
            </label>
          </div>
          {rows.length ? (
            <div className="divide-y divide-[#F3F4F6]">
              {rows.map((r) => (
                <div key={r._id} className="px-5 py-3.5 text-[13.5px] flex flex-wrap gap-2 items-center">
                  <span className="font-bold flex-1 min-w-[160px]">{r.customerName || "—"}</span>
                  <span className="capitalize text-[#6B7280]">{r.frequency}</span>
                  <span className="text-[#6B7280]">next {r.nextRunDate ? new Date(r.nextRunDate).toLocaleDateString("en-IN") : "—"}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={Repeat} title="No recurring invoices yet" sub="Create the first record to get started." />}
        </Card>
      </div>
    </div>
  );
}
