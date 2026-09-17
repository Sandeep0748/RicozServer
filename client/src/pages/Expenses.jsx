import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useExpenses, useCreateExpense, useCustomersQ, useProjects } from "../api/billing";
import { PageHeader, StatCard, Card, Field, inputCls, btnPrimary } from "../components/workspace/ui";
import Modal from "../components/workspace/Modal";
import { paiseToFixed, paiseToINR, inrToPaise } from "../utils/money";

export default function Expenses() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({ search: "", category: "all", billable: "all" });
  const { data } = useExpenses();
  const all = data?.data || [];
  const rows = all.filter((x) => {
    if (filters.search && !`${x.vendor} ${x.category} ${x.notes}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category !== "all" && x.category !== filters.category) return false;
    if (filters.billable === "billable" && !x.billable) return false;
    if (filters.billable === "non" && x.billable) return false;
    return true;
  });
  const total = all.reduce((a, x) => a + (x.amount || 0), 0);
  const billable = all.filter((x) => x.billable).reduce((a, x) => a + (x.amount || 0), 0);
  const [show, setShow] = useState(params.get("action") === "new");

  useEffect(() => { if (params.get("action") === "new") setShow(true); }, [params]);

  return (
    <div>
      <PageHeader eyebrow="Workspace / Expenses" title="Expenses" sub="Track business costs, billable spending, and invoice-ready expenses." />
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label="Total expenses" value={paiseToFixed(total)} />
        <StatCard label="Billable" value={paiseToFixed(billable)} />
        <StatCard label="Non-billable" value={paiseToFixed(total - billable)} />
      </div>
      <div className="mt-3 flex justify-end"><button onClick={() => setShow(true)} className={btnPrimary}>+ Record expense</button></div>

      <Card className="mt-3 p-5">
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 text-[13px]">
          <Field label="Search"><input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Vendor, category, notes" className={inputCls} /></Field>
          <Field label="Date from"><input type="date" className={inputCls} /></Field>
          <Field label="Date to"><input type="date" className={inputCls} /></Field>
          <Field label="Category">
            <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))} className={inputCls}>
              <option value="all">All categories</option><option>Travel</option><option>Food</option><option>Software</option><option>Office</option><option>General</option>
            </select>
          </Field>
          <Field label="Payment method"><select className={inputCls}><option>All methods</option><option>UPI</option><option>Card</option><option>Cash</option></select></Field>
          <Field label="Sort by"><select className={inputCls}><option>Date (newest)</option><option>Amount (high)</option></select></Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3 text-[13px]">
          <Field label="Customer"><select className={inputCls}><option>Select customer</option></select></Field>
          <Field label="Project"><select className={inputCls}><option>Select project</option></select></Field>
          <Field label="Billable">
            <select value={filters.billable} onChange={(e) => setFilters((f) => ({ ...f, billable: e.target.value }))} className={inputCls}>
              <option value="all">All</option><option value="billable">Billable</option><option value="non">Non-billable</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card className="mt-3">
        <div className="hidden md:grid grid-cols-7 gap-2 px-5 py-3 text-[11px] font-bold tracking-[0.08em] text-[#8A8FA3] border-b border-[#F0F0F3]">
          <span>DATE</span><span>CATEGORY</span><span>VENDOR</span><span>AMOUNT</span><span>BILLABLE</span><span>STATUS</span><span>ACTIONS</span>
        </div>
        {rows.length ? rows.map((x) => (
          <div key={x._id} className="grid md:grid-cols-7 gap-2 px-5 py-3 text-[13px] border-t border-[#F6F7F9]">
            <span>{x.date ? new Date(x.date).toLocaleDateString("en-IN") : "—"}</span>
            <span>{x.category}</span><span>{x.vendor || "—"}</span>
            <span className="font-bold">{paiseToINR(x.amount)}</span>
            <span>{x.billable ? "Yes" : "No"}</span><span>{x.status}</span>
            <span className="text-[#9AA3B0]">—</span>
          </div>
        )) : <p className="py-10 text-center text-[13.5px] text-[#6B7280]">No expenses found.</p>}
      </Card>
      {show && <ExpenseModal onClose={() => setShow(false)} />}
    </div>
  );
}

function ExpenseModal({ onClose }) {
  const create = useCreateExpense();
  const { data: custData } = useCustomersQ({ limit: 100 });
  const { data: projData } = useProjects({ limit: 100 });
  const [form, setForm] = useState({ vendor: "", category: "General", amount: "", billable: false, customer: "", paymentMethod: "UPI", notes: "", date: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target?.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await create.mutateAsync({ ...form, amount: inrToPaise(form.amount || "0"), date: form.date || new Date(), projectName: form.project || undefined });
      onClose();
    } catch (e2) { setErr(e2?.response?.data?.error || "Could not save expense."); }
  }

  return (
    <Modal open onClose={onClose} title="Record expense">
      <form onSubmit={submit} className="space-y-3.5">
        {err && <p className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">{err}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vendor"><input value={form.vendor} onChange={set("vendor")} placeholder="Swiggy / AWS" className={inputCls} /></Field>
          <Field label="Category">
            <select value={form.category} onChange={set("category")} className={inputCls}><option>General</option><option>Travel</option><option>Food</option><option>Software</option><option>Office</option></select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (₹)"><input value={form.amount} onChange={set("amount")} required placeholder="850.00" className={inputCls} /></Field>
          <Field label="Date"><input type="date" value={form.date} onChange={set("date")} className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Customer"><select value={form.customer} onChange={set("customer")} className={inputCls}><option value="">Select customer</option>{(custData?.data || []).map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}</select></Field>
          <Field label="Project"><select value={form.project || ""} onChange={set("project")} className={inputCls}><option value="">Select project</option>{(projData?.data || []).map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}</select></Field>
        </div>
        <label className="flex items-center gap-2 text-[13.5px] font-medium"><input type="checkbox" checked={form.billable} onChange={set("billable")} /> Billable to customer</label>
        <Field label="Notes"><input value={form.notes} onChange={set("notes")} placeholder="Client lunch" className={inputCls} /></Field>
        <button className={`${btnPrimary} w-full !py-3`}>Save expense</button>
      </form>
    </Modal>
  );
}
