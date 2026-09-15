import { LayoutDashboard, Ticket, BookOpen, Route, BarChart3, Users, Settings, Headset, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api/client";
import { useState, useEffect } from "react";

const links = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/app/tickets", label: "Tickets", icon: Ticket },
  { to: "/app/knowledge", label: "Knowledge", icon: BookOpen },
  { to: "/app/routing", label: "Routing & SLA", icon: Route },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/customers", label: "Customers", icon: Users },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apiMode, setApiMode] = useState("…");

  useEffect(() => {
    fetch(`${API_URL}/api/health`).then((r) => r.json()).then((j) => setApiMode(j.mode || "?")).catch(() => setApiMode("offline"));
  }, []);

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[#EAEAEA] bg-white">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-[#EFEFEF]">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#C5002B] text-white">
          <Headset className="h-4 w-4" />
        </span>
        <span className="font-bold">RicozServe</span>
      </div>
      <nav className="p-3 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium ${isActive ? "bg-[#FDECEF] text-[#C5002B]" : "text-[#444] hover:bg-[#F5F5F5]"}`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4 space-y-3">
        <div className="rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] p-3 text-xs text-[#555]">
          <p className="font-semibold text-[#222]">API: {apiMode === "mongo" ? "Live · MongoDB" : apiMode === "memory" ? "Live · Memory" : apiMode}</p>
          <p className="mt-1 leading-relaxed">{user ? `${user.name} · ${user.role}` : "Signed in"}</p>
          <button onClick={() => { logout(); navigate("/login"); }} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[#C5002B]">
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
