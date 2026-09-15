import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import Topbar from "../components/Topbar";
import { useTicket, useReplyTicket, usePatchTicket, useArticles } from "../api/hooks";
import { ticketDetail as fbDetail } from "../mocks/tickets";
import { useAuth } from "../context/AuthContext";

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading, isError } = useTicket(id);
  const reply = useReplyTicket(id);
  const patch = usePatchTicket(id);
  const { data: kb } = useArticles({});
  const [text, setText] = useState("");

  const t = data || { ...fbDetail, id: id || fbDetail.id, customer: fbDetail.customer, company: fbDetail.company };
  const suggestions = kb?.data?.slice(0, 3) || [];
  const live = !!data && !isError;

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await reply.mutateAsync({ text, author: user?.name || "Agent" });
    setText("");
  }

  return (
    <div>
      <Topbar title={t.id} subtitle={`${t.subject}${live ? "" : " · demo data"}`} />
      <div className="p-4 sm:p-6 grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          <Link to="/app/tickets" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#555] hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Back to tickets
          </Link>
          {isLoading && <p className="text-sm text-[#777]">Loading ticket…</p>}
          <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
            <div className="flex flex-wrap gap-2 text-xs items-center">
              <span className="rounded-full bg-red-50 border border-red-100 text-[#C5002B] font-semibold px-2.5 py-1">{t.priority}</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold">{t.status}</span>
              <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 font-semibold">{t.channel}</span>
              <span className="rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 font-semibold">{t.sla}</span>
              {live && (
                <span className="ml-auto flex gap-1.5">
                  {[["Open"], ["Pending"], ["Resolved"]].map(([s]) => (
                    <button key={s} disabled={patch.isPending} onClick={() => patch.mutate({ status: s })} className={`rounded-full border px-2.5 py-1 font-semibold ${t.status === s ? "bg-[#111] text-white border-[#111]" : "border-[#DDD] hover:border-[#999]"}`}>{s}</button>
                  ))}
                </span>
              )}
            </div>
            <div className="mt-4 space-y-4">
              {(t.messages || []).map((m, i) => (
                <div key={i} className={`rounded-xl p-4 text-sm leading-relaxed ${m.from === "customer" ? "bg-[#F7F7F7]" : m.from === "internal" || m.from === "system" ? "bg-amber-50 border border-amber-100 text-[#6b5a00]" : "bg-[#FDECEF] border border-red-100"}`}>
                  <p className="text-xs font-semibold mb-1">{m.author} · {m.time}</p>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="mt-4 rounded-xl border border-[#E5E5E5] p-3">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder={live ? "Reply to customer…" : "Reply (log in + API required for live replies)"} className="w-full outline-none text-sm resize-none placeholder:text-[#999]" />
              <div className="mt-2 flex gap-2">
                <button disabled={reply.isPending || !live} className="rounded-lg bg-[#111] text-white text-sm font-semibold px-4 py-2 disabled:opacity-50">{reply.isPending ? "Sending…" : "Send reply"}</button>
                <button type="button" title="AI draft ships in Phase 2" className="rounded-lg border border-[#DDD] text-sm font-semibold px-4 py-2 inline-flex items-center gap-1.5 opacity-70"><Sparkles className="h-4 w-4 text-[#C5002B]" /> AI draft (soon)</button>
              </div>
              {reply.isError && <p className="mt-2 text-xs text-red-600">Reply failed — check API + login.</p>}
            </form>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5 text-sm">
            <h3 className="font-bold">Customer 360</h3>
            <p className="mt-2 font-semibold">{t.customer} · {t.company}</p>
            <p className="text-xs text-[#777] mt-1">Thread: {(t.messages || []).length} messages · Sentiment: {t.sentiment || "—"}</p>
          </div>
          <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5 text-sm">
            <h3 className="font-bold">Suggested knowledge</h3>
            <ul className="mt-3 space-y-2.5">
              {suggestions.map(a => (
                <li key={a.id || a.title} className="rounded-lg border border-[#EFEFEF] p-3 hover:border-[#C5002B]">
                  <p className="font-medium leading-snug">{a.title}</p>
                  <p className="text-xs text-[#888] mt-1">{a.category} · {a.helpful} helpful</p>
                </li>
              ))}
              {!suggestions.length && <li className="text-xs text-[#888]">Sign in to load live suggestions.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
