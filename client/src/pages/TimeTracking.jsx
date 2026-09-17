import { useState } from "react";
import { useTimeEntries, useCreateTime, useProjects, useCustomersQ } from "../api/billing";
import { PageHeader, StatCard, Card, Field, inputCls, btnPrimary } from "../components/workspace/ui";
import Modal from "../components/workspace/Modal";
import { paiseToINR, fmtHours } from "../utils/money";

export default function TimeTracking() {
  const { data } = useTimeEntries({ limit: 100 });
  const rows = data?.data || [];
  const { data: projData } = useProjects({ limit: 100 });
  const { data: custData } = useCustomersQ({ limit: 100 });
  const create = useCreateTime();
  const [timer, setTimer] = useState({ project: "", customer: "", task: "", hours: "", billable: true });
  const [showManual, setShowManual] = useState(false);
  const [msg, setMsg] = useState("");

  const totalH = rows.reduce((a, x) => a + (x.hours || 0), 0);
  const billH = rows.filter((x) => x.billable).reduce((a, x) => a + (x.hours || 0), 0);
  const billAmt = rows.filter((x) => x.billable).reduce((a, x) => a + (x.amount || x.hours * 100000 || 0), 0);

  async function startTimer(e) {
    e.preventDefault();
    setMsg("");
    try {
      await create.mutateAsync({ projectName: timer.project, customerName: timer.customer, task: timer.task, hours: Number(timer.hours) || 0.5, billable: timer.billable, date: new Date() });
      setMsg("Time logged — bill it from an invoice.");
      setTimer({ project: "", customer: "", task: "", hours: "", billable: true });
    } catch (err) { setMsg(err?.response?.data?.error || "Could not log time."); }
  }

  return (
    <div>
      <PageHeader eyebrow="Workspace / Time tracking" title="Time tracking" sub="Capture billable work, run timers, and turn approved time into invoices." />

      <Card className="p-6">
        <h2 className="font-bold text-[17px]">Timer</h2>
        <p className="text-[12.5px] text-[#8A8FA3]">Track work while the app is open.</p>
        <form onSubmit={startTimer} className="mt-4 grid md:grid-cols-[1fr_1fr_1fr_120px_120px_auto] gap-3 items-end text-[13px]">
          <Field label="Project">
            <select value={timer.project} onChange={(e) => setTimer((t) => ({ ...t, project: e.target.value }))} className={inputCls}>
              <option value="">Select project</option>{(projData?.data || []).map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Customer">
            <select value={timer.customer} onChange={(e) => setTimer((t) => ({ ...t, customer: e.target.value }))} className={inputCls}>
              <option value="">Select customer</option>{(custData?.data || []).map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Task"><input value={timer.task} onChange={(e) => setTimer((t) => ({ ...t, task: e.target.value }))} placeholder="Task" className={inputCls} /></Field>
          <Field label="Hours"><input value={timer.hours} onChange={(e) => setTimer((t) => ({ ...t, hours: e.target.value }))} placeholder="0" className={inputCls} /></Field>
          <label className="flex items-center gap-2 font-medium pb-3"><input type="checkbox" checked={timer.billable} onChange={(e) => setTimer((t) => ({ ...t, billable: e.target.checked }))} /> Billable</label>
          <button className="rounded-xl bg-[#C4122F] text-white font-semibold px-8 py-3">Start timer</button>
        </form>
        {msg && <p className="mt-2 text-[13px] font-medium">{msg}</p>}
      </Card>

      <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard label="Total hours" value={fmtHours(totalH)} />
        <StatCard label="Billable hours" value={fmtHours(billH)} />
        <StatCard label="Non-billable" value={fmtHours(totalH - billH)} />
        <StatCard label="Billable amount" value={paiseToINR(billAmt)} />
      </div>

      <div className="mt-3 flex justify-end"><button onClick={() => setShowManual(true)} className={btnPrimary}>+ Add time manually</button></div>

      <Card className="mt-3 p-5">
        <div className="grid sm:grid-cols-5 gap-3 text-[13px]">
          <Field label="Project"><select className={inputCls}><option>Select project</option></select></Field>
          <Field label="Customer"><select className={inputCls}><option>Select customer</option></select></Field>
          <Field label="Employee"><select className={inputCls}><option>All employees</option></select></Field>
          <Field label="Range"><select className={inputCls}><option>All time</option><option>This week</option><option>This month</option></select></Field>
          <Field label="Date"><input type="date" className={inputCls} /></Field>
        </div>
        <div className="mt-4 divide-y divide-[#F3F4F6] text-[13px]">
          {rows.length ? rows.map((r) => (
            <div key={r._id} className="py-2.5 flex flex-wrap gap-2 items-center">
              <span className="font-bold flex-1 min-w-[160px]">{r.task || "Work"} · {r.projectName || "—"}</span>
              <span className="text-[#6B7280]">{r.customerName || ""}</span>
              <span className="font-bold">{fmtHours(r.hours)}</span>
              <span className="text-[11.5px] font-bold rounded-full bg-[#F3F4F6] px-2.5 py-1">{r.billable ? "Billable" : "Non-billable"}</span>
            </div>
          )) : <p className="py-6 text-center text-[#8A8FA3]">No time entries yet — start the timer above.</p>}
        </div>
      </Card>

      {showManual && <ManualTimeModal onClose={() => setShowManual(false)} />}
    </div>
  );
}

function ManualTimeModal({ onClose }) {
  const create = useCreateTime();
  const [form, setForm] = useState({ task: "", projectName: "", customerName: "", hours: "", billable: true });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target?.type === "checkbox" ? e.target.checked : e.target.value }));
  async function submit(e) {
    e.preventDefault();
    await create.mutateAsync({ ...form, hours: Number(form.hours) || 1, date: new Date() });
    onClose();
  }
  return (
    <Modal open onClose={onClose} title="Add time manually">
      <form onSubmit={submit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Project"><input value={form.projectName} onChange={set("projectName")} className={inputCls} /></Field>
          <Field label="Customer"><input value={form.customerName} onChange={set("customerName")} className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Task"><input value={form.task} onChange={set("task")} required className={inputCls} /></Field>
          <Field label="Hours"><input value={form.hours} onChange={set("hours")} required placeholder="2.5" className={inputCls} /></Field>
        </div>
        <label className="flex items-center gap-2 text-[13.5px]"><input type="checkbox" checked={form.billable} onChange={set("billable")} /> Billable</label>
        <button className={`${btnPrimary} w-full`}>Save time</button>
      </form>
    </Modal>
  );
}
