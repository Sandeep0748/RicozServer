import { useState } from "react";
import { Package, Search } from "lucide-react";
import { useCreditNotes, useDebitNotes, useCreateCredit, useCreateDebit, useCustomersQ, useInvoices } from "../api/billing";
import { Card, EmptyState, Field, inputCls } from "../components/workspace/ui";
import { paiseToINR, inrToPaise } from "../utils/money";

export function NotePage({ kind }) {
  const isCredit = kind === "credit";
  const creditQ = useCreditNotes();
  const debitQ = useDebitNotes();
  const { data } = isCredit ? creditQ : debitQ;
  const rows = data?.data || [];
  const { data: custData } = useCustomersQ({ limit: 100 });
  const { data: invData } = useInvoices({ limit: 100 });
  const createCredit = useCreateCredit();
  const createDebit = useCreateDebit();
  const create = isCredit ? createCredit : createDebit;
  const [form, setForm] = useState({ customer: "", invoice: "", description: "", amount: "", taxRate: "", reason: "" });
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await create.mutateAsync({ ...form, amount: inrToPaise(form.amount || "0"), taxRate: Number(form.taxRate) || 0 });
      setForm({ customer: "", invoice: "", description: "", amount: "", taxRate: "", reason: "" });
      setMsg(`${isCredit ? "Credit" : "Debit"} note saved and linked.`);
    } catch (err) { setMsg(err?.response?.data?.error || "Could not save."); }
  }

  return (
    <div>
      <p className="text-[12.5px] text-[#6B7280]">Workspace / {isCredit ? "Credit notes" : "Debit notes"}</p>
      <h1 className="mt-1 text-[32px] font-extrabold tracking-tight">{isCredit ? "Credit notes" : "Debit notes"}</h1>
      <p className="mt-1 text-[14px] text-[#6B7280]">{isCredit ? "Apply account credits against invoice balances." : "Record adjustments against source invoices."}</p>

      <div className="mt-5 grid lg:grid-cols-[380px_1fr] gap-4 items-start">
        <Card className="p-6">
          <h2 className="font-bold text-[17px]">Add {isCredit ? "credit" : "debit"} note</h2>
          <p className="text-[12.5px] text-[#8A8FA3]">Your organization owns and controls these records.</p>
          <form onSubmit={submit} className="mt-4 space-y-3.5">
            <Field label="Customer">
              <select value={form.customer} onChange={set("customer")} className={inputCls}>
                <option value="">Select customer</option>
                {(custData?.data || []).map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Invoice">
              <select value={form.invoice} onChange={set("invoice")} className={inputCls}>
                <option value="">Select invoice</option>
                {(invData?.data || []).map((i) => <option key={i._id} value={i.number}>{i.number} · {i.customerName}</option>)}
              </select>
            </Field>
            <Field label="Description"><input value={form.description} onChange={set("description")} className={inputCls} /></Field>
            <Field label="Amount (minor units)"><input value={form.amount} onChange={set("amount")} placeholder="1500 (₹)" className={inputCls} /></Field>
            <Field label="Tax rate (%)"><input value={form.taxRate} onChange={set("taxRate")} placeholder="18" className={inputCls} /></Field>
            <Field label="Reason"><input value={form.reason} onChange={set("reason")} placeholder="Rate correction" className={inputCls} /></Field>
            <button className="w-full rounded-xl bg-[#C4122F] text-white font-semibold py-3">Save</button>
            {msg && <p className="text-[13px] font-medium">{msg}</p>}
          </form>
        </Card>

        <Card>
          <div className="p-5 border-b border-[#F0F0F3] flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <h2 className="font-bold text-[17px]">{isCredit ? "Credit notes" : "Debit notes"} <span className="text-[#9AA3B0]">{data?.total || 0}</span></h2>
              <p className="text-[12.5px] text-[#8A8FA3]">Review and manage organization records.</p>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm w-60">
              <Search className="h-4 w-4 text-[#9AA3B0]" />
              <input placeholder={`Search ${isCredit ? "credit" : "debit"} notes`} className="outline-none w-full bg-transparent" />
            </label>
          </div>
          {rows.length ? (
            <div className="divide-y divide-[#F3F4F6]">
              {rows.map((n) => (
                <div key={n._id} className="px-5 py-3.5 text-[13.5px] flex flex-wrap gap-2 items-center">
                  <span className="font-bold">{n.number || String(n._id).slice(-6)}</span>
                  <span className="flex-1 min-w-[140px]">{n.customerName}</span>
                  <span className="font-bold">{paiseToINR(n.amount)}</span>
                  <span className="text-[11.5px] rounded-full bg-[#F3F4F6] px-2.5 py-1 font-bold">{n.status}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={Package} title={`No ${isCredit ? "credit" : "debit"} notes yet`} sub="Create the first record to get started." />}
        </Card>
      </div>
    </div>
  );
}
