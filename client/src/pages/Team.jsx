import { useState } from "react";
import { Search } from "lucide-react";
import { useTeam } from "../api/billing";
import { Card } from "../components/workspace/ui";

export default function Team() {
  const [q, setQ] = useState("");
  const { data } = useTeam();
  const rows = (data?.data || []).filter((u) => !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <p className="text-[12.5px] text-[#6B7280]">Workspace / Team</p>
      <h1 className="mt-1 text-[32px] font-extrabold tracking-tight">Team</h1>
      <p className="mt-1 text-[14px] text-[#6B7280]">Review members and their workspace roles.</p>

      <Card className="mt-5 max-w-[460px]">
        <div className="p-5 border-b border-[#F0F0F3] flex items-center gap-3">
          <div className="flex-1">
            <h2 className="font-bold text-[17px]">Team <span className="text-[#9AA3B0] font-semibold">{data?.total || 0}</span></h2>
            <p className="text-[12.5px] text-[#8A8FA3]">Review and manage organization records.</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm w-44">
            <Search className="h-4 w-4 text-[#9AA3B0]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search team" className="outline-none w-full bg-transparent" />
          </label>
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {rows.length ? rows.map((u) => (
            <div key={u.id} className="px-5 py-3.5">
              <p className="font-bold text-[14px]">{u.name}</p>
              <p className="text-[12.5px] text-[#8A8FA3]">{u.email} · <span className="capitalize">{u.role}</span></p>
            </div>
          )) : <p className="px-5 py-6 text-[13px] text-[#8A8FA3]">No members match.</p>}
        </div>
      </Card>
    </div>
  );
}
