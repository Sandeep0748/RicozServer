import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api/client";

export default function Settings() {
  const { user } = useAuth();
  const cards = [
    ["General", "Workspace name, timezone, business hours, logo."],
    ["Roles & permissions", `Signed in as ${user?.name || "—"} (${user?.role || "—"}). Admin manages users via API.`],
    ["Channels", "Email, chat widget, WhatsApp, voice, social connectors."],
    ["API", `Connected to ${API_URL}. Health: ${API_URL}/api/health`],
  ];
  return (
    <div>
      <Topbar title="Settings" subtitle="Workspace, roles, channels, and API" />
      <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-4 text-sm">
        {cards.map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
            <h3 className="font-bold">{t}</h3>
            <p className="mt-2 text-[#666] leading-relaxed">{d}</p>
            <button title="Full settings console ships next" className="mt-4 rounded-lg border border-[#DDD] px-4 py-2 font-semibold hover:border-[#999]">Configure</button>
          </div>
        ))}
      </div>
    </div>
  );
}
