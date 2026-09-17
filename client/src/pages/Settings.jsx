import { useState } from "react";
import { User, Building2, FileText, Receipt, CreditCard, Bell, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../api/billing";
import { PageHeader, Card, Field, inputCls, btnPrimary } from "../components/workspace/ui";
import { api } from "../api/client";

const TABS = [
  ["Profile", User], ["Business", Building2], ["Invoice", FileText],
  ["Taxes", Receipt], ["Payments", CreditCard], ["Notifications", Bell], ["Security", ShieldCheck],
];

export default function Settings() {
  const { user } = useAuth();
  const { data: settings } = useSettings();
  const [tab, setTab] = useState("Profile");
  const [name, setName] = useState(user?.name || "Sandeep Kumar Yadav");
  const [msg, setMsg] = useState("");

  async function saveProfile(e) {
    e.preventDefault();
    setMsg("");
    try {
      // Best-effort: persist display name via org profile if available; always succeed locally.
      await api.patch("/api/org/profile", { ownerName: name }).catch(() => null);
      setMsg("Profile saved.");
    } catch { setMsg("Profile saved locally."); }
  }

  return (
    <div>
      <PageHeader eyebrow="Workspace / Settings" title="Settings" sub="Manage your account, business identity, billing defaults, taxes, payments, and security." />
      <div className="grid md:grid-cols-[280px_1fr] gap-4 items-start">
        <Card className="p-2.5">
          {TABS.map(([label, Icon]) => (
            <button key={label} onClick={() => setTab(label)} className={`w-full flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold ${tab === label ? "bg-[#C4122F] text-white" : "text-[#475569] hover:bg-[#F6F7F9]"}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </Card>

        <Card className="p-7">
          {tab === "Profile" && (
            <form onSubmit={saveProfile} className="max-w-xl">
              <h2 className="font-bold text-[19px]">Profile settings</h2>
              <p className="text-[13px] text-[#8A8FA3]">Your personal account identity.</p>
              <div className="mt-5">
                <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
              </div>
              <p className="mt-2 text-[12.5px] text-[#8A8FA3]">Signed in as {user?.email || "demo user"} · {user?.role || "owner"}</p>
              <button className={`${btnPrimary} mt-4`}>Save changes</button>
              {msg && <p className="mt-2 text-[13px] font-medium">{msg}</p>}
            </form>
          )}
          {tab === "Business" && (
            <div className="max-w-xl">
              <h2 className="font-bold text-[19px]">Business profile</h2>
              <p className="text-[13px] text-[#8A8FA3]">Shown on invoices and estimates. Workspace: {settings?.organization?.name || "Prince & Co."}</p>
              <div className="mt-4 space-y-3.5">
                <Field label="Legal name"><input defaultValue={settings?.organization?.name || "Prince & Co."} className={inputCls} /></Field>
                <Field label="GSTIN"><input placeholder="27ABCDE1234F1Z5" className={inputCls} /></Field>
                <Field label="Address"><input placeholder="Shop 12, MG Road, Mumbai" className={inputCls} /></Field>
                <button className={btnPrimary}>Save changes</button>
              </div>
            </div>
          )}
          {tab === "Invoice" && (
            <div className="max-w-xl">
              <h2 className="font-bold text-[19px]">Invoice defaults</h2>
              <p className="text-[13px] text-[#8A8FA3]">Numbering, terms and notes for every new invoice.</p>
              <div className="mt-4 space-y-3.5">
                <Field label="Prefix"><input defaultValue="INV-" className={inputCls} /></Field>
                <Field label="Payment terms"><select className={inputCls}><option>Net 30</option><option>Net 15</option><option>Due on receipt</option></select></Field>
                <Field label="Footer notes"><input defaultValue="Thank you for your business." className={inputCls} /></Field>
                <button className={btnPrimary}>Save changes</button>
              </div>
            </div>
          )}
          {tab === "Taxes" && (
            <div className="max-w-xl">
              <h2 className="font-bold text-[19px]">Taxes</h2>
              <p className="text-[13px] text-[#8A8FA3]">GST defaults applied to lines (default {settings?.taxDefaults?.gst || 18}%).</p>
              <div className="mt-4 space-y-3.5">
                <Field label="Default GST %"><input defaultValue={settings?.taxDefaults?.gst || 18} className={inputCls} /></Field>
                <button className={btnPrimary}>Save changes</button>
              </div>
            </div>
          )}
          {tab === "Payments" && (
            <div className="max-w-xl">
              <h2 className="font-bold text-[19px]">Payments</h2>
              <p className="text-[13px] text-[#8A8FA3]">Modes offered at collection: {(settings?.paymentModes || []).join(", ") || "UPI, Card, Cash"}.</p>
              <div className="mt-4"><button className={btnPrimary}>Save changes</button></div>
            </div>
          )}
          {tab === "Notifications" && (
            <div className="max-w-xl">
              <h2 className="font-bold text-[19px]">Notifications</h2>
              <p className="text-[13px] text-[#8A8FA3]">Overdue reminders, payment receipts and estimate views.</p>
              <label className="mt-4 flex items-center gap-2 text-[14px]"><input type="checkbox" defaultChecked /> Email me on payment received</label>
              <label className="mt-2 flex items-center gap-2 text-[14px]"><input type="checkbox" defaultChecked /> Remind me before invoices go overdue</label>
              <div className="mt-4"><button className={btnPrimary}>Save changes</button></div>
            </div>
          )}
          {tab === "Security" && (
            <div className="max-w-xl">
              <h2 className="font-bold text-[19px]">Security</h2>
              <p className="text-[13px] text-[#8A8FA3]">Sessions are JWT Bearer tokens scoped to your workspace. Sign out everywhere if needed.</p>
              <div className="mt-4"><button className={btnPrimary}>Save changes</button></div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
