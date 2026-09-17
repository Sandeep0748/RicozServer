import {
  LayoutDashboard, FileText, FileCheck, Repeat, Users, Box,
  Receipt, FolderKanban, Timer, CreditCard, Landmark, BarChart3, Bell, UsersRound, Settings,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/estimates", label: "Estimates", icon: FileCheck },
  { to: "/recurring-invoices", label: "Recurring", icon: Repeat },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/items", label: "Items", icon: Box },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/time-tracking", label: "Time tracking", icon: Timer },
  { to: "/credit-notes", label: "Credit notes", icon: CreditCard },
  { to: "/debit-notes", label: "Debit notes", icon: Landmark },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/team", label: "Team", icon: UsersRound },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function WorkspaceSidebar() {
  const { org, user } = useAuth();
  const navigate = useNavigate();
  const wsName = org?.name || "Prince & Co.";
  const initials = wsName.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[#ECECF0] bg-white min-h-screen sticky top-0 h-screen">
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 px-5 h-16 border-b border-[#F0F0F3] text-left">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#C4122F] text-white font-extrabold text-lg">R</span>
        <span className="font-extrabold text-[17px] tracking-tight">Ricoz<span className="text-[#6B7280] font-semibold">Invoice</span></span>
      </button>

      <div className="p-3">
        <button className="w-full flex items-center gap-2.5 rounded-xl border border-[#ECECF0] px-3 py-2.5 hover:bg-[#FAFAFB] text-left">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FFF1F2] text-[#C4122F] text-xs font-bold">{initials}</span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13.5px] font-bold truncate">{wsName}</span>
            <span className="block text-[11.5px] text-[#8A8FA3]">Workspace</span>
          </span>
          <span className="text-[#8A8FA3]">⌄</span>
        </button>
      </div>

      <p className="px-5 pt-1 pb-2 text-[11px] font-bold tracking-[0.14em] text-[#8A8FA3]">WORKSPACE</p>
      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-colors ${isActive ? "bg-[#F6F7F9] text-[#111827] font-semibold shadow-sm" : "text-[#5B6478] hover:bg-[#F6F7F9]"}`
            }
          >
            <Icon className="h-[17px] w-[17px] shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-[#F0F0F3]">
        <div className="rounded-xl bg-[#FFF1F2] border border-[#FDE2E4] p-3">
          <p className="text-[13px] font-bold">Make room for growth</p>
          <p className="mt-1 text-[12px] text-[#6B7280] leading-relaxed">Keep your books calm as business picks up.</p>
          <button onClick={() => navigate("/reports")} className="mt-2 text-[12.5px] font-bold text-[#C4122F]">Explore plans ↗</button>
        </div>
        <div className="mt-2 flex items-center gap-2 px-1 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FFF1F2] text-[#C4122F] text-[11px] font-bold">
            {(user?.name || "PP").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[12.5px] font-bold truncate">{user?.name || "Prafull Prince"}</span>
            <span className="block text-[11.5px] text-[#8A8FA3] capitalize">{user?.role || "Owner"}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
