import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Topbar from "../components/Topbar";
import { useTickets, useCreateTicket } from "../api/hooks";
import { tickets as fbTickets } from "../mocks/tickets";

const channelColor = { Email: "bg-blue-100 text-blue-700", WhatsApp: "bg-green-100 text-green-700", Chat: "bg-purple-100 text-purple-700", Instagram: "bg-pink-100 text-pink-700", Voice: "bg-amber-100 text-amber-700", Portal: "bg-gray-100 text-gray-600", Social: "bg-pink-100 text-pink-700" };

export default function Tickets() {
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState(params.get("status") || "");
  const [priority, setPriority] = useState("");
  const [channel, setChannel] = useState("");
  const search = params.get("search") || "";
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", customerName: "", company: "", priority: "Medium", channel: "Email" });

  const { data, isLoading, isError, refetch } = useTickets({ status: status || undefined, priority: priority || undefined, channel: channel || undefined, search: search || undefined, limit: 50 });
  const create = useCreateTicket();
  const rows = data?.data?.length ? data.data : (isLoading || isError ? fbTickets : []);
  const live = !!data?.data && !isError;

  function setSearch(v) {
    const next = new URLSearchParams(params);
    if (v) next.set("search", v); else next.delete("search");
    setParams(next);
  }

  async function submit(e) {
    e.preventDefault();
    await create.mutateAsync(form);
    setShowNew(false);
    setForm({ subject: "", description: "", customerName: "", company: "", priority: "Medium", channel: "Email" });
    refetch();
  }

  return (
    <div>
      <Topbar title="Tickets" subtitle={`Omnichannel case management${live ? " · live" : " · demo data"}`} />
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subject, customer…" className="rounded-lg border border-[#DDD] bg-white px-3 py-2 text-sm w-64 outline-none focus:border-[#C5002B]" />
          {[["status", status, setStatus, ["", "Open", "Pending", "Resolved"]], ["priority", priority, setPriority, ["", "Urgent", "High", "Medium", "Low"]], ["channel", channel, setChannel, ["", "Email", "Chat", "WhatsApp", "Voice", "Instagram", "Portal"]]].map(([key, val, set, opts]) => (
            <select key={key} value={val} onChange={(e) => set(e.target.value)} className="rounded-lg border border-[#DDD] bg-white px-3 py-2 text-sm outline-none">
              <option value="">{key[0].toUpperCase() + key.slice(1)}: all</option>
              {opts.filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          <button onClick={() => setShowNew(true)} className="ml-auto rounded-lg bg-[#111] text-white text-sm font-semibold px-4 py-2">+ New ticket</button>
        </div>

        {showNew && (
          <form onSubmit={submit} className="rounded-2xl border border-[#EAEAEA] bg-white p-5 grid sm:grid-cols-2 gap-3 text-sm">
            <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="rounded-lg border border-[#DDD] px-3 py-2 outline-none sm:col-span-2" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-[#DDD] px-3 py-2 outline-none sm:col-span-2" rows={3} />
            <input placeholder="Customer name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="rounded-lg border border-[#DDD] px-3 py-2 outline-none" />
            <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="rounded-lg border border-[#DDD] px-3 py-2 outline-none" />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="rounded-lg border border-[#DDD] px-3 py-2 outline-none">
              {["Urgent", "High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="rounded-lg border border-[#DDD] px-3 py-2 outline-none">
              {["Email", "Chat", "WhatsApp", "Voice", "Instagram", "Portal"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <div className="sm:col-span-2 flex gap-2">
              <button disabled={create.isPending} className="rounded-lg bg-[#C5002B] text-white font-semibold px-4 py-2 disabled:opacity-60">{create.isPending ? "Creating…" : "Create ticket"}</button>
              <button type="button" onClick={() => setShowNew(false)} className="rounded-lg border border-[#DDD] px-4 py-2 font-semibold">Cancel</button>
              {create.isError && <span className="text-sm text-red-600 self-center">Failed — is the API running & are you logged in?</span>}
            </div>
          </form>
        )}

        {isLoading && <p className="text-sm text-[#777]">Loading tickets…</p>}
        <div className="rounded-2xl border border-[#EAEAEA] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#888] border-b border-[#EFEFEF]">
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {rows.map(t => (
                  <tr key={t.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3">
                      <Link to={`/app/tickets/${t.id}`} className="font-semibold hover:text-[#C5002B]">
                        <span className="font-mono text-xs text-[#888] mr-2">{t.id}</span>{t.subject}
                      </Link>
                      <p className="text-xs text-[#888] mt-0.5">{t.updated}</p>
                    </td>
                    <td className="px-4 py-3"><p className="font-medium">{t.customer}</p><p className="text-xs text-[#888]">{t.company}</p></td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${channelColor[t.channel] || "bg-gray-100 text-gray-600"}`}>{t.channel}</span></td>
                    <td className="px-4 py-3 text-xs font-semibold">{t.priority}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${t.status === "Open" ? "bg-red-50 text-[#C5002B] border border-red-100" : t.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-green-50 text-green-700 border border-green-100"}`}>{t.status}</span></td>
                    <td className="px-4 py-3 text-xs">{t.agent}</td>
                    <td className="px-4 py-3 text-xs font-medium">{t.sla}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
