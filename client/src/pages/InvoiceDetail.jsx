import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useInvoice, usePayInvoice, useSettings } from "../api/billing";
import { Card, Field, inputCls, btnPrimary } from "../components/workspace/ui";
import { paiseToINR, paiseToFixed, inrToPaise } from "../utils/money";

export default function InvoiceDetail() {
  const { id } = useParams();
  const { data: inv, isLoading } = useInvoice(id);
  const { data: settings } = useSettings();
  const pay = usePayInvoice(id);
  const [amount, setAmount] = useState("");
  const methods = settings?.paymentMethods?.length ? settings.paymentMethods : ["UPI"];
  const [method, setMethod] = useState("");
  const methodValue = method || methods[0] || "UPI";
  const [msg, setMsg] = useState("");
  const biz = settings?.business || {};

  if (isLoading) return <p className="text-sm text-[#8A8FA3]">Loading invoice…</p>;
  if (!inv) return <p className="text-sm">Invoice not found. <Link to="/invoices" className="font-bold text-[#C4122F]">Back</Link></p>;

  async function collect(e) {
    e.preventDefault();
    setMsg("");
    try {
      await pay.mutateAsync({ amount: inrToPaise(amount), method: methodValue });
      setMsg("Payment recorded — overview and reports updated.");
      setAmount("");
    } catch (err) { setMsg(err?.response?.data?.error || "Payment failed."); }
  }

  return (
    <div>
      <p className="text-[11.5px] font-extrabold uppercase tracking-[0.18em] text-[#C4122F]">Workspace / Invoices / {inv.number}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-[30px] font-extrabold tracking-tight">{inv.number} · {inv.customerName}</h1>
        <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] font-bold capitalize">{inv.status}</span>
        <Link to="/invoices" className="ml-auto text-[13px] font-bold text-[#C4122F]">← All invoices</Link>
      </div>

      <div className="mt-4 grid lg:grid-cols-[1.5fr_1fr] gap-4">
        <Card className="p-6">
          {(biz.name || biz.gstin || biz.address) && (
            <div className="mb-4 rounded-xl bg-[#F6F7F9] px-4 py-3 text-[12.5px] text-[#475569]">
              <p className="font-bold text-[#111827] text-[13.5px]">{biz.name || "Your business"}</p>
              {[biz.address, [biz.gstin && `GSTIN ${biz.gstin}`, biz.phone].filter(Boolean).join(" · ")].filter(Boolean).map((l) => (
                <p key={l}>{l}</p>
              ))}
              <p className="mt-1 text-[11px] text-[#9AA3B0]">From Business settings</p>
            </div>
          )}
          <h3 className="font-bold">Lines</h3>
          <div className="mt-3 divide-y divide-[#F3F4F6] text-[13.5px]">
            {(inv.lines || []).map((l, i) => (
              <div key={i} className="py-2.5 flex items-center gap-3">
                <span className="flex-1 font-medium">{l.name} <span className="text-[#9AA3B0]">× {l.qty}</span></span>
                <span>{paiseToINR(l.rate)}</span>
                <span className="font-bold w-24 text-right">{paiseToINR(l.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 text-[13.5px] max-w-xs ml-auto">
            <div className="flex justify-between"><span className="text-[#6B7280]">Subtotal</span><span className="font-bold">{paiseToINR(inv.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">Tax</span><span className="font-bold">{paiseToINR(inv.taxTotal)}</span></div>
            <div className="flex justify-between text-[16px]"><span className="font-bold">Total</span><span className="font-extrabold">{paiseToINR(inv.total)}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">Paid</span><span className="font-bold text-[#16A34A]">{paiseToINR(inv.paid)}</span></div>
            <div className="flex justify-between"><span className="font-bold">Balance</span><span className="font-extrabold">{paiseToINR(inv.total - inv.paid)}</span></div>
          </div>
          {inv.notes && (
            <div className="mt-4 rounded-xl bg-[#F6F7F9] px-4 py-3 text-[12.5px] text-[#475569]">
              <p className="font-bold text-[#111827] text-[12px]">NOTES</p>
              <p className="mt-1 whitespace-pre-wrap">{inv.notes}</p>
            </div>
          )}
          {(inv.payments || []).length > 0 && (
            <div className="mt-5">
              <h4 className="text-[13px] font-bold text-[#6B7280]">PAYMENTS</h4>
              {(inv.payments || []).map((p, i) => (
                <div key={i} className="flex justify-between py-1.5 text-[13px] border-t border-[#F3F4F6]">
                  <span>{p.method} · {p.date ? new Date(p.date).toLocaleDateString("en-IN") : ""}</span>
                  <span className="font-bold text-[#16A34A]">{paiseToFixed(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 h-fit">
          <h3 className="font-bold">Collect payment</h3>
          <p className="text-[12.5px] text-[#8A8FA3]">Balance {paiseToINR(inv.total - inv.paid)}</p>
          <form onSubmit={collect} className="mt-3 space-y-3">
            <Field label="Amount (₹)"><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000.00" required className={inputCls} /></Field>
            <Field label="Method">
              <select value={methodValue} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
                {methods.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <button disabled={pay.isPending} className={`${btnPrimary} w-full`}>{pay.isPending ? "Recording…" : "Record payment"}</button>
          </form>
          {msg && <p className="mt-3 text-[13px] font-medium">{msg}</p>}
          <div className="mt-4 text-[12.5px] text-[#6B7280]">Next: expenses, time and reports pick this payment up automatically.</div>
        </Card>
      </div>
    </div>
  );
}
