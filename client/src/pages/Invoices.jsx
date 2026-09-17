import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FileText, FilePlus2, Search } from "lucide-react";
import { useInvoices, useCreateInvoice, useCustomersQ, useItems, useSettings } from "../api/billing";
import { PageHeader, StatCard, Card, EmptyState, Field, inputCls, btnPrimary } from "../components/workspace/ui";
import Modal from "../components/workspace/Modal";
import { paiseToINR, inrToPaise } from "../utils/money";

export default function Invoices() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const { data } = useInvoices({ search: q || undefined, status: status === "all" ? undefined : status });
  const rows = data?.data || [];
  const stats = data?.stats || { loaded: 0, awaiting: 0, overdue: 0, outstanding: 0 };
  const [showNew, setShowNew] = useState(params.get("action") === "new");

  useEffect(() => { if (params.get("action") === "new") setShowNew(true); }, [params]);

  return (
    <div>
      <PageHeader eyebrow="Workspace / Invoices" title="Invoices" sub="Create, track, and collect every customer invoice in one place." />
      <div className="flex flex-wrap gap-3 items-stretch">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 flex-1">
          <StatCard label="Invoices loaded" value={stats.loaded} />
          <StatCard label="Awaiting payment" value={stats.awaiting} />
          <StatCard label="Overdue" value={stats.overdue} />
          <StatCard label="Outstanding" value={paiseToINR(stats.outstanding)} />
        </div>
        <button onClick={() => setShowNew(true)} className={`${btnPrimary} self-center !px-5 !py-3`}><FilePlus2 className="h-4 w-4" /> New invoice</button>
      </div>

      <Card className="mt-4">
        <div className="p-5 border-b border-[#F0F0F3] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <h2 className="font-bold text-[17px]">Invoices <span className="text-[#9AA3B0] font-semibold">{data?.total || 0}</span></h2>
            <p className="text-[12.5px] text-[#8A8FA3]">Search and review your billing history.</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm w-64">
            <Search className="h-4 w-4 text-[#9AA3B0]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Invoice or customer" className="outline-none w-full bg-transparent" />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm font-medium">
            <option value="all">All statuses</option>
            <option value="draft">Draft</option><option value="sent">Sent</option>
            <option value="partial">Partial</option><option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        {rows.length ? (
          <div className="divide-y divide-[#F3F4F6]">
            {rows.map((i) => (
              <Link key={i._id} to={`/invoices/${i._id}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-[#FAFAFB] text-[13.5px]">
                <span className="font-bold w-24">{i.number}</span>
                <span className="flex-1 min-w-[160px] font-medium">{i.customerName}</span>
                <span className="text-[#6B7280]">{i.status}</span>
                <span className="font-extrabold w-24 text-right">{paiseToINR(i.total)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={FileText} title="No invoices yet" sub="Create your first invoice to begin tracking revenue." action={<button onClick={() => setShowNew(true)} className={btnPrimary}>New invoice</button>} />
        )}
      </Card>

      {showNew && <InvoiceModal onClose={() => { setShowNew(false); navigate("/invoices"); }} />}
    </div>
  );
}

export function InvoiceModal({ onClose, defaultCustomer }) {
  const { data: custData } = useCustomersQ({ limit: 100 });
  const { data: itemData } = useItems({ limit: 100 });
  const { data: settings } = useSettings();
  const create = useCreateInvoice();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(defaultCustomer || "");
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!customer) { setErr("Select a customer first — add one in Customers if empty."); return; }
    const items = itemData?.data || [];
    const picked = items.find((x) => x.name === itemName) || items[0];
    const lineRate = rate ? inrToPaise(rate) : (picked?.rate || 50000);
    const inv0 = settings?.invoice || {};
    const taxRate = picked?.taxRate ?? inv0.defaultTax ?? 18;
    try {
      const inv = await create.mutateAsync({
        customer,
        lines: [{ name: picked?.name || itemName || "Service", qty: Number(qty) || 1, rate: lineRate, taxRate }],
        paymentTerms: inv0.paymentTerms || undefined,
        notes: inv0.notes || undefined,
      });
      onClose?.();
      navigate(`/invoices/${inv._id || inv.id}`);
    } catch (e2) { setErr(e2?.response?.data?.error || "Could not create invoice."); }
  }

  return (
    <Modal open onClose={onClose} title="New invoice">
      <form onSubmit={submit} className="space-y-4">
        {err && <p className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">{err}</p>}
        <Field label="Customer">
          <select value={customer} onChange={(e) => setCustomer(e.target.value)} className={inputCls}>
            <option value="">Select customer</option>
            {(custData?.data || []).map((c) => <option key={c._id} value={c.name}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Item / description"><input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder={(itemData?.data?.[0]?.name) || "Service"} className={inputCls} /></Field>
          <Field label="Qty"><input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className={inputCls} /></Field>
          <Field label="Rate (₹)"><input value={rate} onChange={(e) => setRate(e.target.value)} placeholder="500.00" className={inputCls} /></Field>
        </div>
        <p className="text-[12px] text-[#8A8FA3]">Journey tip: Customer → Item → Invoice → Collect payment from invoice detail. Tax {settings?.invoice?.defaultTax ?? 18}% · {settings?.invoice?.paymentTerms || "Net 30"} · {(settings?.invoice?.prefix || "INV") + "-####"} numbering from Invoice settings.</p>
        <button disabled={create.isPending} className={`${btnPrimary} w-full !py-3`}>{create.isPending ? "Creating…" : "Create & open invoice"}</button>
      </form>
    </Modal>
  );
}
