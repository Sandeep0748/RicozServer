import { useState } from "react";
import { Package, Search } from "lucide-react";
import { useProjects, useCreateProject } from "../api/billing";
import { Card, EmptyState, Field, inputCls } from "../components/workspace/ui";
import { paiseToINR, inrToPaise } from "../utils/money";

export default function Projects() {
  const [q, setQ] = useState("");
  const { data } = useProjects({ search: q || undefined });
  const rows = data?.data || [];
  const create = useCreateProject();
  const [form, setForm] = useState({ name: "", billingMethod: "Fixed", budget: "", description: "" });
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await create.mutateAsync({ ...form, budget: inrToPaise(form.budget || "0") });
      setForm({ name: "", billingMethod: "Fixed", budget: "", description: "" });
      setMsg("Project saved.");
    } catch (err) { setMsg(err?.response?.data?.error || "Could not save."); }
  }

  return (
    <div>
      <p className="text-[12.5px] text-[#6B7280]">Workspace / Projects</p>
      <h1 className="mt-1 text-[32px] font-extrabold tracking-tight">Projects</h1>
      <p className="mt-1 text-[14px] text-[#6B7280]">Organize delivery, budgets, and billable work.</p>

      <div className="mt-5 grid lg:grid-cols-[380px_1fr] gap-4 items-start">
        <Card className="p-6">
          <h2 className="font-bold text-[17px]">Add project</h2>
          <p className="text-[12.5px] text-[#8A8FA3]">Your organization owns and controls these records.</p>
          <form onSubmit={submit} className="mt-4 space-y-3.5">
            <Field label="Project name"><input value={form.name} onChange={set("name")} required className={inputCls} /></Field>
            <Field label="Billing method">
              <select value={form.billingMethod} onChange={set("billingMethod")} className={inputCls}>
                <option>Fixed</option><option>Hourly</option><option>Retainer</option>
              </select>
            </Field>
            <Field label="Budget (minor units)"><input value={form.budget} onChange={set("budget")} placeholder="50000 (₹)" className={inputCls} /></Field>
            <Field label="Description"><input value={form.description} onChange={set("description")} className={inputCls} /></Field>
            <button className="w-full rounded-xl bg-[#C4122F] text-white font-semibold py-3">Save</button>
            {msg && <p className="text-[13px] font-medium">{msg}</p>}
          </form>
        </Card>

        <Card>
          <div className="p-5 border-b border-[#F0F0F3] flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <h2 className="font-bold text-[17px]">Projects <span className="text-[#9AA3B0]">{data?.total || 0}</span></h2>
              <p className="text-[12.5px] text-[#8A8FA3]">Review and manage organization records.</p>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm w-56">
              <Search className="h-4 w-4 text-[#9AA3B0]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects" className="outline-none w-full bg-transparent" />
            </label>
          </div>
          {rows.length ? (
            <div className="divide-y divide-[#F3F4F6]">
              {rows.map((p) => (
                <div key={p._id} className="px-5 py-3.5 text-[13.5px] flex flex-wrap gap-2 items-center">
                  <span className="font-bold flex-1 min-w-[160px]">{p.name}</span>
                  <span className="text-[#6B7280]">{p.billingMethod}</span>
                  <span className="font-bold">{paiseToINR(p.budget)}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={Package} title="No projects yet" sub="Create the first record to get started." />}
        </Card>
      </div>
    </div>
  );
}
