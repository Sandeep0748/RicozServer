import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Search } from "lucide-react";
import { useItems, useCreateItem, useDeleteItem, useSettings } from "../api/billing";
import { PageHeader, StatCard, Card, EmptyState, Field, inputCls, btnPrimary } from "../components/workspace/ui";
import Modal from "../components/workspace/Modal";
import { paiseToINR, inrToPaise } from "../utils/money";

export default function Items() {
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const { data } = useItems({ search: q || undefined, type });
  const rows = data?.data || [];
  const stats = data?.stats || { total: 0, services: 0, products: 0 };
  const [show, setShow] = useState(params.get("action") === "new");
  const del = useDeleteItem();

  useEffect(() => { if (params.get("action") === "new") setShow(true); }, [params]);

  return (
    <div>
      <PageHeader eyebrow="Workspace / Items & Services" title="Items & services" sub="Keep reusable products and services ready for faster invoicing." />
      <div className="flex flex-wrap gap-3 items-stretch">
        <div className="grid grid-cols-3 gap-3 flex-1">
          <StatCard label="Catalog items" value={stats.total} />
          <StatCard label="Services" value={stats.services} />
          <StatCard label="Products" value={stats.products} />
        </div>
        <button onClick={() => setShow(true)} className="bg-[#C4122F] hover:bg-[#A50E27] text-white font-semibold px-5 rounded-xl self-center py-3 text-[14px]">+ Add item</button>
      </div>

      <Card className="mt-4">
        <div className="p-5 border-b border-[#F0F0F3] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <h2 className="font-bold text-[17px]">Catalog <span className="text-[#9AA3B0]">{data?.total || 0}</span></h2>
            <p className="text-[12.5px] text-[#8A8FA3]">Reusable products and services.</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm w-64">
            <Search className="h-4 w-4 text-[#9AA3B0]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, SKU, description" className="outline-none w-full bg-transparent" />
          </label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm font-medium">
            <option value="all">All types</option><option value="product">Products</option><option value="service">Services</option>
          </select>
        </div>
        {rows.length ? (
          <div className="divide-y divide-[#F3F4F6]">
            {rows.map((it) => (
              <div key={it._id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-[13.5px]">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#F6F7F9]"><Box className="h-4 w-4" /></span>
                <span className="flex-1 min-w-[180px]"><span className="font-bold block">{it.name}</span><span className="text-[12px] text-[#8A8FA3]">{it.sku || "—"} · {it.type}</span></span>
                <span className="font-extrabold">{paiseToINR(it.rate)}</span>
                <button onClick={() => del.mutate(it._id)} className="text-[12px] font-bold text-[#9AA3B0] hover:text-red-600">Delete</button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Box} title="No catalog items yet" sub="Add products and services to create invoices faster." action={<button onClick={() => setShow(true)} className={btnPrimary}>Add item</button>} />
        )}
      </Card>
      {show && <ItemModal onClose={() => setShow(false)} />}
    </div>
  );
}

function ItemModal({ onClose }) {
  const create = useCreateItem();
  const { data: settings } = useSettings();
  const [form, setForm] = useState({ name: "", sku: "", description: "", type: "product", rate: "", taxRate: String(settings?.invoice?.defaultTax ?? 18) });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await create.mutateAsync({ ...form, rate: inrToPaise(form.rate || "0"), taxRate: Number(form.taxRate) || 0 });
      onClose();
    } catch (e2) { setErr(e2?.response?.data?.error || "Could not save item."); }
  }

  return (
    <Modal open onClose={onClose} title="Add item">
      <form onSubmit={submit} className="space-y-3.5">
        {err && <p className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">{err}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><input value={form.name} onChange={set("name")} required placeholder="Design hours" className={inputCls} /></Field>
          <Field label="Type">
            <select value={form.type} onChange={set("type")} className={inputCls}><option value="product">Product</option><option value="service">Service</option></select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="SKU"><input value={form.sku} onChange={set("sku")} placeholder="SVC-001" className={inputCls} /></Field>
          <Field label="Rate (₹)"><input value={form.rate} onChange={set("rate")} placeholder="1500" className={inputCls} /></Field>
          <Field label="Tax %"><input value={form.taxRate} onChange={set("taxRate")} className={inputCls} /></Field>
        </div>
        <Field label="Description"><input value={form.description} onChange={set("description")} placeholder="Per hour, GST extra" className={inputCls} /></Field>
        <button className={`${btnPrimary} w-full !py-3`}>Save item</button>
      </form>
    </Modal>
  );
}
