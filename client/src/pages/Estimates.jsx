import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileCheck2, Search } from "lucide-react";
import { useEstimates, useCreateEstimate, useConvertEstimate, usePatchEstimate, useCustomersQ } from "../api/billing";
import { PageHeader, StatCard, Card, EmptyState, Field, inputCls, btnPrimary } from "../components/workspace/ui";
import Modal from "../components/workspace/Modal";
import { paiseToINR, inrToPaise } from "../utils/money";

export default function Estimates() {
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const { data } = useEstimates({ search: q || undefined, status: status === "all" ? undefined : status });
  const rows = data?.data || [];
  const stats = data?.stats || { loaded: 0, awaiting: 0, accepted: 0, converted: 0 };
  const [showNew, setShowNew] = useState(params.get("action") === "new");
  const convert = useConvertEstimate();
  const patch = usePatchEstimate();

  useEffect(() => { if (params.get("action") === "new") setShowNew(true); }, [params]);

  return (
    <div>
      <PageHeader eyebrow="Workspace / Estimates" title="Estimates" sub="Prepare proposals, follow customer decisions, and turn accepted work into invoices." />
      <div className="flex flex-wrap gap-3 items-stretch">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 flex-1">
          <StatCard label="Estimates loaded" value={stats.loaded} />
          <StatCard label="Awaiting response" value={stats.awaiting} />
          <StatCard label="Accepted" value={stats.accepted} />
          <StatCard label="Converted" value={stats.converted} />
        </div>
        <button onClick={() => setShowNew(true)} className={`${btnPrimary} self-center !px-5 !py-3`}>+ New estimate</button>
      </div>

      <Card className="mt-4">
        <div className="p-5 border-b border-[#F0F0F3] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <h2 className="font-bold text-[17px]">Estimates <span className="text-[#9AA3B0]">{data?.total || 0}</span></h2>
            <p className="text-[12.5px] text-[#8A8FA3]">Review proposals and move accepted work forward.</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm w-64">
            <Search className="h-4 w-4 text-[#9AA3B0]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Estimate or customer" className="outline-none w-full bg-transparent" />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm font-medium">
            <option value="all">All statuses</option>
            <option value="sent">Sent</option><option value="accepted">Accepted</option>
            <option value="declined">Declined</option><option value="converted">Converted</option>
          </select>
        </div>
        {rows.length ? (
          <div className="divide-y divide-[#F3F4F6]">
            {rows.map((e) => (
              <div key={e._id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-[13.5px]">
                <span className="font-bold w-24">{e.number}</span>
                <span className="flex-1 min-w-[160px]">{e.customerName}</span>
                <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11.5px] font-bold capitalize">{e.status}</span>
                <span className="font-extrabold w-24 text-right">{paiseToINR(e.total)}</span>
                <span className="flex gap-2">
                  {e.status !== "converted" && <button onClick={() => patch.mutate({ id: e._id, status: "accepted" })} className="text-[12px] font-bold text-[#16A34A]">Accept</button>}
                  {["accepted", "sent"].includes(e.status) && <button disabled={convert.isPending} onClick={() => convert.mutate(e._id)} className="text-[12px] font-bold text-[#C4122F]">Convert → Invoice</button>}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={FileCheck2} title="No estimates yet" sub="Create your first proposal to start the sales process." action={<button onClick={() => setShowNew(true)} className={btnPrimary}>New estimate</button>} />
        )}
      </Card>
      {showNew && <EstimateModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function EstimateModal({ onClose }) {
  const { data: custData } = useCustomersQ({ limit: 100 });
  const create = useCreateEstimate();
  const [customer, setCustomer] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await create.mutateAsync({ customer, lines: [{ name: title || "Proposed work", qty: 1, rate: inrToPaise(amount || "1000"), taxRate: 18 }] });
      onClose();
    } catch (e2) { setErr(e2?.response?.data?.error || "Could not create estimate."); }
  }

  return (
    <Modal open onClose={onClose} title="New estimate">
      <form onSubmit={submit} className="space-y-4">
        {err && <p className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">{err}</p>}
        <Field label="Customer">
          <select value={customer} onChange={(e) => setCustomer(e.target.value)} className={inputCls}>
            <option value="">Select customer</option>
            {(custData?.data || []).map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Scope / title"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Website redesign" className={inputCls} /></Field>
          <Field label="Amount (₹)"><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25000" className={inputCls} /></Field>
        </div>
        <button className={`${btnPrimary} w-full !py-3`}>Create estimate</button>
        <p className="text-[12px] text-[#8A8FA3]">After acceptance, use Convert → Invoice to continue the journey without re-typing.</p>
      </form>
    </Modal>
  );
}
