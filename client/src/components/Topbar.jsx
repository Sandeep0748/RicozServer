import { Bell, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, subtitle }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const initials = (user?.name || "SK").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  function submit(e) {
    e.preventDefault();
    navigate(`/app/tickets?search=${encodeURIComponent(q)}`);
  }

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[#EAEAEA]">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        <Link to="/" className="md:hidden text-sm font-bold">RicozServe</Link>
        <div className="hidden md:block">
          <h1 className="text-[17px] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-[#777]">{subtitle}</p>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={submit} className="hidden sm:flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] px-3 py-2 text-sm w-64">
            <Search className="h-4 w-4 text-[#888]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tickets, customers…" className="bg-transparent outline-none w-full placeholder:text-[#999]" />
          </form>
          <button title="Notifications (v1: static)" className="relative grid h-10 w-10 place-items-center rounded-lg border border-[#E5E5E5] hover:bg-[#F6F6F6]">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#C5002B]" />
          </button>
          <button
            title={user ? `${user.name} (${user.role}) — click to log out` : "Account"}
            onClick={() => { if (user && confirm("Log out of RicozServe?")) { logout(); navigate("/login"); } }}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#111] text-white text-xs font-bold"
          >
            {initials}
          </button>
        </div>
      </div>
      {/* mobile nav */}
      <div className="md:hidden flex gap-1 overflow-x-auto px-3 pb-3 text-[13px] font-medium">
        {[["/app","Overview"],["/app/tickets","Tickets"],["/app/knowledge","Knowledge"],["/app/routing","Routing"],["/app/analytics","Analytics"],["/app/customers","Customers"],["/app/settings","Settings"]].map(([to,l]) => (
          <Link key={to+l} to={to} className="whitespace-nowrap rounded-full border border-[#E5E5E5] px-3 py-1.5 bg-white">{l}</Link>
        ))}
      </div>
    </div>
  );
}
