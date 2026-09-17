import { useState } from "react";
import { Inbox, Search } from "lucide-react";
import { useNotifications, useReadAllNotifications } from "../api/billing";
import { Card, EmptyState, btnGhost } from "../components/workspace/ui";

export default function Notifications() {
  const [q, setQ] = useState("");
  const { data } = useNotifications({ search: q || undefined });
  const rows = data?.data || [];
  const readAll = useReadAllNotifications();

  return (
    <div>
      <p className="text-[12.5px] text-[#6B7280]">Workspace / Notifications</p>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[32px] font-extrabold tracking-tight">Notifications</h1>
        {data?.unread > 0 && <button onClick={() => readAll.mutate()} className={btnGhost}>Mark all read</button>}
      </div>
      <p className="mt-1 text-[14px] text-[#6B7280]">Review activity across your workspace.</p>

      <Card className="mt-5 max-w-[460px]">
        <div className="p-5 border-b border-[#F0F0F3] flex items-center gap-3">
          <div className="flex-1">
            <h2 className="font-bold text-[17px]">Notifications <span className="text-[#9AA3B0] font-semibold">{data?.total || 0}</span></h2>
            <p className="text-[12.5px] text-[#8A8FA3]">Review and manage organization records.</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm w-44">
            <Search className="h-4 w-4 text-[#9AA3B0]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notificat" className="outline-none w-full bg-transparent" />
          </label>
        </div>
        {rows.length ? (
          <div className="divide-y divide-[#F3F4F6]">
            {rows.map((n) => (
              <div key={n._id} className="px-5 py-3.5 text-[13.5px]">
                <p className="font-bold">{!n.read && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#C4122F]" />}{n.title}</p>
                <p className="text-[#6B7280]">{n.body}</p>
                <p className="mt-1 text-[11.5px] text-[#9AA3B0]">{n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}</p>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={Inbox} title="No notifications yet" sub="Create the first record to get started." />}
      </Card>
    </div>
  );
}
