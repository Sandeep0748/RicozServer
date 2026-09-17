import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, Plus, ChevronDown } from "lucide-react";
import { useNotifications } from "../../api/billing";

const TITLES = {
  "/dashboard": "Overview",
  "/invoices": "Invoices",
  "/estimates": "Estimates",
  "/recurring-invoices": "Recurring invoices",
  "/customers": "Customers",
  "/items": "Items & services",
  "/expenses": "Expenses",
  "/projects": "Projects",
  "/time-tracking": "Time tracking",
  "/credit-notes": "Credit notes",
  "/debit-notes": "Debit notes",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/team": "Team",
  "/settings": "Settings",
};

export default function WorkspaceTopbar() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useNotifications();
  const unread = data?.unread || 0;
  const base = `/${location.pathname.split("/")[1]}`;
  const title = TITLES[base] || TITLES[location.pathname] || "Overview";

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#ECECF0]">
      <div className="flex items-center gap-3 px-4 sm:px-7 h-16">
        <Link to="/dashboard" className="md:hidden font-extrabold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#C4122F] text-white">R</span></Link>
        <div className="hidden sm:flex items-center gap-2 text-[13.5px]">
          <span className="rounded-full bg-[#FFF1F2] text-[#C4122F] font-bold px-3 py-1">Workspace</span>
          <span className="text-[#C9CDD6]">/</span>
          <span className="font-bold text-[#111827]">{title}</span>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <button onClick={() => navigate("/notifications")} title="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#E5E7EB] hover:bg-[#F6F7F9]">
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#C4122F]" />}
          </button>
          <div className="relative" ref={ref}>
            <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#C4122F] hover:bg-[#A50E27] text-white font-semibold px-4 py-2.5 text-[14px] shadow-[0_8px_20px_rgba(196,18,47,0.3)]">
              <Plus className="h-4 w-4" strokeWidth={2.5} /> Create <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#ECECF0] bg-white shadow-xl p-1.5 text-[13.5px]">
                {[
                  ["New invoice", "/invoices?action=new"],
                  ["New estimate", "/estimates?action=new"],
                  ["New customer", "/customers?action=new"],
                  ["Log expense", "/expenses?action=new"],
                  ["Add item", "/items?action=new"],
                ].map(([label, to]) => (
                  <button key={label} onClick={() => { setOpen(false); navigate(to); }} className="w-full text-left rounded-lg px-3 py-2.5 hover:bg-[#F6F7F9] font-medium">
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden flex gap-1.5 overflow-x-auto px-3 pb-3 text-[12.5px] font-medium">
        {[["/dashboard", "Overview"], ["/invoices", "Invoices"], ["/estimates", "Estimates"], ["/customers", "Customers"], ["/items", "Items"], ["/expenses", "Expenses"], ["/reports", "Reports"]].map(([to, l]) => (
          <Link key={to} to={to} className="whitespace-nowrap rounded-full border border-[#E5E7EB] px-3 py-1.5 bg-white">{l}</Link>
        ))}
      </div>
    </div>
  );
}
