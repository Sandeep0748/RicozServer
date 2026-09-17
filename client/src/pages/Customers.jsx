import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Users, Search, Building2, Mail } from "lucide-react";
import { useCustomersQ, useCreateCustomer } from "../api/billing";
import { PageHeader, StatCard, Card, EmptyState, Field, inputCls, btnPrimary } from "../components/workspace/ui";
import Modal from "../components/workspace/Modal";

export default function Customers() {
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const { data } = useCustomersQ({ search: q || undefined });
  const rows = data?.data || [];
  const [show, setShow] = useState(params.get("action") === "new");

  useEffect(() => { if (params.get("action") === "new") setShow(true); }, [params]);

  const withEmail = rows.filter((x) => x.email).length;
  const companies = new Set(rows.map((x) => x.company).filter(Boolean)).size;

  return (
    <div>
      <PageHeader eyebrow="Workspace / Customers" title="Customers" sub="Keep customer contacts, companies, and billing currencies organized." />
      <div className="flex flex-wrap gap-3 items-stretch">
        <div className="grid grid-cols-3 gap-3 flex-1">
          <StatCard label="Customers" value={data?.total ?? rows.length} icon={Users} />
          <StatCard label="With email" value={withEmail} icon={Mail} />
          <StatCard label="Companies" value={companies} icon={Building2} />
        </div>
        <button onClick={() => setShow(true)} className="bg-[#C4122F] hover:bg-[#A50E27] text-white font-semibold px-5 rounded-xl self-center py-3 text-[14px]">+ Add customer</button>
      </div>

      <Card className="mt-4">
        <div className="p-5 border-b border-[#F0F0F3] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <h2 className="font-bold text-[17px]">Customer directory <span className="text-[#9AA3B0] font-semibold">{data?.total || 0}</span></h2>
            <p className="text-[12.5px] text-[#8A8FA3]">Contacts available for invoices and estimates.</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm w-64">
            <Search className="h-4 w-4 text-[#9AA3B0]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, company, email" className="outline-none w-full bg-transparent" />
          </label>
        </div>
        {rows.length ? (
          <div className="divide-y divide-[#F3F4F6]">
            {rows.map((c) => (
              <div key={c._id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-[13.5px]">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFF1F2] text-[#C4122F] text-[12px] font-bold">{c.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</span>
                <span className="flex-1 min-w-[180px]"><span className="font-bold block">{c.name}</span><span className="text-[#8A8FA3] text-[12px]">{c.company || "—"} · {c.email || "no email"}</span></span>
                <span className="text-[12px] text-[#6B7280]">{c.tickets ?? 0} docs</span>
                <Link to={`/invoices?action=new`} className="text-[12.5px] font-bold text-[#C4122F]">New invoice →</Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Users} title="No customers yet" sub="Add your first customer to start creating invoices and estimates." action={<button onClick={() => setShow(true)} className={btnPrimary}>Add customer</button>} />
        )}
      </Card>
      {show && <CustomerModal onClose={() => setShow(false)} />}
    </div>
  );
}

export function CustomerModal({ onClose }) {
  const create = useCreateCustomer();
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", gstin: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try { await create.mutateAsync(form); onClose?.(); }
    catch (e2) { setErr(e2?.response?.data?.error || "Could not save customer."); }
  }

  return (
    <Modal open onClose={onClose} title="Add customer">
      <form onSubmit={submit} className="space-y-3.5">
        {err && <p className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">{err}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name / billing name"><input value={form.name} onChange={set("name")} required placeholder="Aarav Mehta" className={inputCls} /></Field>
          <Field label="Company"><input value={form.company} onChange={set("company")} placeholder="ShopKart" className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email"><input type="email" value={form.email} onChange={set("email")} placeholder="aarav@shopkart.in" className={inputCls} /></Field>
          <Field label="Phone"><input value={form.phone} onChange={set("phone")} placeholder="+91…" className={inputCls} /></Field>
        </div>
        <Field label="GSTIN (optional)"><input value={form.gstin} onChange={set("gstin")} placeholder="27ABCDE1234F1Z5" className={inputCls} /></Field>
        <button disabled={create.isPending} className={`${btnPrimary} w-full !py-3`}>{create.isPending ? "Saving…" : "Save customer"}</button>
        <p className="text-[12px] text-[#8A8FA3]">Next step in the journey: add an item, then create an estimate or invoice.</p>
      </form>
    </Modal>
  );
}
