import { useState } from "react";
import Topbar from "../components/Topbar";
import { useCustomers } from "../api/hooks";
import { customers as fbCustomers } from "../mocks/customers";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useCustomers({ search: search || undefined, limit: 50 });
  const rows = data?.data?.length ? data.data : (isLoading || isError ? fbCustomers : []);
  const live = !!data?.data && !isError;

  return (
    <div>
      <Topbar title="Customers" subtitle={`Contacts + accounts · 360° history${live ? " · live" : " · demo data"}`} />
      <div className="p-4 sm:p-6 space-y-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…" className="rounded-lg border border-[#DDD] bg-white px-3 py-2 text-sm w-64 outline-none focus:border-[#C5002B]" />
        {isLoading && <p className="text-sm text-[#777]">Loading customers…</p>}
        <div className="rounded-2xl border border-[#EAEAEA] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#888] border-b border-[#EFEFEF]">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Tickets</th>
                  <th className="px-4 py-3">CSAT</th>
                  <th className="px-4 py-3">Health</th>
                  <th className="px-4 py-3">Last active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {rows.map(c => (
                  <tr key={c.id || c.name} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="px-4 py-3">{c.company}</td>
                    <td className="px-4 py-3">{c.tickets}</td>
                    <td className="px-4 py-3">{c.csats || c.csat}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${c.health === "Healthy" ? "bg-green-100 text-green-700" : c.health === "Champion" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{c.health}</span></td>
                    <td className="px-4 py-3 text-xs text-[#777]">{c.lastActive || "—"}</td>
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
