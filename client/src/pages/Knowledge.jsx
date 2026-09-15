import { useState } from "react";
import Topbar from "../components/Topbar";
import { useArticles } from "../api/hooks";
import { articles as fbArticles } from "../mocks/articles";
import { Search } from "lucide-react";

export default function Knowledge() {
  const [q, setQ] = useState("");
  const { data, isLoading, isError } = useArticles({ q: q || undefined });
  const rows = data?.data?.length ? data.data : (!q && (isLoading || isError) ? fbArticles : []);
  const live = !!data?.data && !isError;

  return (
    <div>
      <Topbar title="Knowledge base" subtitle={`Resolution guidance + self-service help center${live ? " · live" : ""}`} />
      <div className="p-4 sm:p-6 space-y-4">
        <div className="rounded-2xl bg-[#111] text-white p-6">
          <h3 className="text-xl font-bold">How can we help?</h3>
          <label className="mt-3 flex items-center gap-2 rounded-xl bg-white text-black px-4 py-3 max-w-xl">
            <Search className="h-4 w-4 text-[#888]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles, guides, FAQs…" className="w-full outline-none text-sm" />
          </label>
        </div>
        {isLoading && <p className="text-sm text-[#777]">Searching…</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map(a => (
            <div key={a.id || a.title} className="rounded-2xl border border-[#EAEAEA] bg-white p-5 hover:border-[#C5002B] transition-colors">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#C5002B]">{a.category}</span>
              <h4 className="mt-2 font-bold leading-snug">{a.title}</h4>
              <p className="mt-2 text-xs text-[#777]">{a.views} views · {a.helpful} helpful · Updated {a.updated}</p>
            </div>
          ))}
        </div>
        {!rows.length && !isLoading && <p className="text-sm text-[#777]">No articles found{q ? ` for “${q}”` : ""}.</p>}
      </div>
    </div>
  );
}
