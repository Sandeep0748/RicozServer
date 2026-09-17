import { Link } from "react-router-dom";

export function PageHeader({ eyebrow, title, sub }) {
  return (
    <div className="mb-5">
      {eyebrow && <p className="text-[11.5px] font-extrabold uppercase tracking-[0.18em] text-[#C4122F]">{eyebrow}</p>}
      <h1 className="mt-2 text-[30px] sm:text-[36px] leading-[1.05] font-extrabold tracking-[-0.02em] text-[#111827]">{title}</h1>
      {sub && <p className="mt-2 text-[14.5px] text-[#6B7280]">{sub}</p>}
    </div>
  );
}

export function StatCard({ label, value, sub, accent = "#111827", icon: Icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#ECECF0] bg-white p-5">
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">{label}</p>
        {Icon && <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F6F7F9]"><Icon className="h-4 w-4 text-[#6B7280]" /></span>}
      </div>
      <p className="mt-3 text-[26px] font-extrabold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-[12.5px] text-[#8A8FA3]">{sub}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="py-14 px-6 text-center">
      {Icon && <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#FFF1F2]"><Icon className="h-5 w-5 text-[#C4122F]" /></span>}
      <p className="mt-4 font-bold text-[#111827]">{title}</p>
      {sub && <p className="mt-1.5 text-[13.5px] text-[#6B7280] max-w-md mx-auto">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-[#ECECF0] bg-white ${className}`}>{children}</div>;
}

export function Field({ label, children }) {
  return (
    <label className="block text-[13px] font-semibold text-[#475569]">
      {label}
      <span className="mt-1.5 block font-normal">{children}</span>
    </label>
  );
}

export const inputCls = "w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-[#C4122F] focus:ring-2 focus:ring-[#C4122F]/10 placeholder:text-[#9AA3B0]";
export const btnPrimary = "inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C4122F] hover:bg-[#A50E27] text-white font-semibold px-4 py-2.5 text-[14px] shadow-[0_8px_20px_rgba(196,18,47,0.25)] disabled:opacity-60";
export const btnGhost = "inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white font-semibold px-4 py-2.5 text-[14px] hover:bg-[#F6F7F9]";

export function ViewAll({ to }) {
  return <Link to={to} className="text-[12.5px] font-bold text-[#C4122F]">View all →</Link>;
}
