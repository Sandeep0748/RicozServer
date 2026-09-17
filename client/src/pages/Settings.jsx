import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building2, FileText, Receipt, CreditCard, Bell, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings, useUpdateSettings, useUpdateProfile, useChangePassword, useLogoutEverywhere } from "../api/billing";
import { PageHeader, Card, Field, inputCls, btnPrimary } from "../components/workspace/ui";
import { TOKEN_KEY, api } from "../api/client";

const TABS = [
  ["Profile", User], ["Business", Building2], ["Invoice", FileText],
  ["Taxes", Receipt], ["Payments", CreditCard], ["Notifications", Bell], ["Security", ShieldCheck],
];

function useSyncedState(source) {
  const [val, setVal] = useState(source);
  useEffect(() => { setVal(source); }, [JSON.stringify(source)]);
  return [val, setVal];
}

function SaveBar({ saving, saved, error, label = "Save changes" }) {
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button disabled={saving} className="rounded-xl bg-[#C4122F] hover:bg-[#A50E27] text-white font-semibold px-5 py-2.5 text-[14px] disabled:opacity-60">
        {saving ? "Saving…" : label}
      </button>
      {saved && <span className="text-[13px] font-semibold text-[#16A34A]">Saved.</span>}
      {error && <span className="text-[13px] font-semibold text-red-600">{error}</span>}
    </span>
  );
}

function useSave(section) {
  const mut = useUpdateSettings();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  async function save(data) {
    setSaved(false); setError("");
    try {
      await mut.mutateAsync({ section, data });
      setSaved(true);
    } catch (e) { setError(e?.response?.data?.error || "Could not save."); }
  }
  return { save, saving: mut.isPending, saved, error };
}

function ProfileTab() {
  const { user, refresh } = useAuth();
  const update = useUpdateProfile();
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setName(user?.name || ""); }, [user?.name]);

  async function submit(e) {
    e.preventDefault();
    setSaved(false); setError("");
    try {
      await update.mutateAsync({ name });
      await refresh();
      setSaved(true);
    } catch (err) { setError(err?.response?.data?.error || "Could not save."); }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <h2 className="font-bold text-[19px]">Profile settings</h2>
      <p className="mt-1 text-[13px] text-[#8A8FA3]">Your personal account identity.</p>
      <div className="mt-6">
        <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} /></Field>
      </div>
      <p className="mt-2 text-[12.5px] text-[#8A8FA3]">Signed in as {user?.email || "demo user"} · <span className="capitalize">{user?.role || "owner"}</span></p>
      <div className="mt-5"><SaveBar saving={update.isPending} saved={saved} error={error} /></div>
    </form>
  );
}

const BIZ_FIELDS = [
  ["name", "Business name"], ["logoUrl", "Logo URL"],
  ["email", "Business email"], ["phone", "Phone"],
  ["website", "Website"], ["businessType", "Business type"],
  ["gstin", "GSTIN"], ["pan", "PAN"],
  ["currency", "Currency"], ["timezone", "Timezone"],
];

function BusinessTab({ initial }) {
  const [form, setForm] = useSyncedState({ ...(initial || {}) });
  const { save, saving, saved, error } = useSave("business");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(form); }}>
      <h2 className="font-bold text-[19px]">Business settings</h2>
      <p className="mt-1 text-[13px] text-[#8A8FA3]">Business identity, tax registration, and addresses.</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-x-5 gap-y-4">
        {BIZ_FIELDS.map(([k, label]) => (
          <Field key={k} label={label}>
            <input value={form[k] || ""} onChange={set(k)} placeholder={k === "currency" ? "INR" : k === "timezone" ? "UTC" : ""} className={inputCls} />
          </Field>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-[#8A8FA3]">Shown on invoices and estimates alongside every document you send.</p>
      <div className="mt-4"><SaveBar saving={saving} saved={saved} error={error} /></div>
    </form>
  );
}

function InvoiceTab({ initial }) {
  const [form, setForm] = useSyncedState({ ...(initial || {}) });
  const { save, saving, saved, error } = useSave("invoice");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); save({ ...form, startNumber: Number(form.startNumber) || 1, defaultTax: Number(form.defaultTax) || 0 }); }}>
      <h2 className="font-bold text-[19px]">Invoice settings</h2>
      <p className="mt-1 text-[13px] text-[#8A8FA3]">Document defaults, payment details, and appearance.</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-x-5 gap-y-4">
        <Field label="Currency">
          <select value={form.currency || "INR"} onChange={set("currency")} className={inputCls}>
            <option>INR</option><option>USD</option><option>EUR</option><option>GBP</option><option>AED</option>
          </select>
        </Field>
        <Field label="Payment terms">
          <select value={form.paymentTerms || "Net 30"} onChange={set("paymentTerms")} className={inputCls}>
            <option>Due on receipt</option><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option>
          </select>
        </Field>
        <Field label="Invoice prefix"><input value={form.prefix ?? ""} onChange={set("prefix")} placeholder="INV" className={inputCls} /></Field>
        <Field label="Starting invoice number"><input type="number" min="1" value={form.startNumber ?? 1} onChange={set("startNumber")} className={inputCls} /></Field>
        <Field label="Default tax %"><input type="number" min="0" max="100" value={form.defaultTax ?? 0} onChange={set("defaultTax")} className={inputCls} /></Field>
      </div>
      <div className="mt-4">
        <Field label="Default invoice notes"><textarea value={form.notes || ""} onChange={set("notes")} rows={4} placeholder="Thank you for your business." className={`${inputCls} resize-y`} /></Field>
      </div>
      <div className="mt-4">
        <Field label="Default invoice terms"><textarea value={form.terms || ""} onChange={set("terms")} rows={3} placeholder="Payment due within 30 days." className={`${inputCls} resize-y`} /></Field>
      </div>
      <p className="mt-3 text-[12px] text-[#8A8FA3]">New invoices pick up these terms, notes and numbering automatically.</p>
      <div className="mt-4"><SaveBar saving={saving} saved={saved} error={error} /></div>
    </form>
  );
}

function TaxesTab({ initial }) {
  const [taxes, setTaxes] = useSyncedState(Array.isArray(initial) ? initial : []);
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const { save, saving, saved, error } = useSave("taxes");

  function add() {
    if (!name.trim()) return;
    setTaxes((t) => [...t, { name: name.trim().slice(0, 60), rate: Math.min(100, Math.max(0, Number(rate) || 0)) }]);
    setName(""); setRate("");
  }

  return (
    <div>
      <h2 className="font-bold text-[19px]">Taxes settings</h2>
      <p className="mt-1 text-[13px] text-[#8A8FA3]">Tax rates available across billing workflows.</p>
      {taxes.length > 0 && (
        <div className="mt-5 divide-y divide-[#F3F4F6] rounded-xl border border-[#ECECF0] max-w-2xl">
          {taxes.map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 text-[13.5px]">
              <span className="flex-1 font-semibold">{t.name}</span>
              <span className="font-bold">{t.rate}%</span>
              <button onClick={() => setTaxes((x) => x.filter((_, j) => j !== i))} title="Remove" className="text-[#9AA3B0] hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 grid sm:grid-cols-2 gap-x-5 gap-y-4 max-w-2xl">
        <Field label="Tax name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="GST" className={inputCls} /></Field>
        <Field label="Rate %"><input type="number" min="0" max="100" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="18" className={inputCls} /></Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={add} className="rounded-xl bg-[#C4122F] hover:bg-[#A50E27] text-white font-semibold px-5 py-2.5 text-[14px]">Add tax</button>
        <SaveBar saving={saving} saved={saved} error={error} />
      </div>
      <p className="mt-3 text-[12px] text-[#8A8FA3]">Add first, then Save changes — rates appear wherever line taxes are chosen.</p>
    </div>
  );
}

function PaymentsTab({ initial }) {
  const [methods, setMethods] = useSyncedState(Array.isArray(initial) && initial.length ? initial : []);
  const [val, setVal] = useState("");
  const { save, saving, saved, error } = useSave("paymentMethods");

  function add() {
    if (!val.trim() || methods.includes(val.trim())) return;
    setMethods((m) => [...m, val.trim().slice(0, 40)]);
    setVal("");
  }

  return (
    <div>
      <h2 className="font-bold text-[19px]">Payments settings</h2>
      <p className="mt-1 text-[13px] text-[#8A8FA3]">Payment methods offered to your customers.</p>
      {methods.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2 max-w-2xl">
          {methods.map((m) => (
            <span key={m} className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-3.5 py-1.5 text-[13px] font-semibold">
              {m}
              <button onClick={() => setMethods((x) => x.filter((y) => y !== m))} title="Remove" className="text-[#9AA3B0] hover:text-red-600">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 max-w-2xl">
        <Field label="Payment method"><input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Bank transfer, card, cash..." className={inputCls} /></Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={add} className="rounded-xl bg-[#C4122F] hover:bg-[#A50E27] text-white font-semibold px-5 py-2.5 text-[14px]">Add payment method</button>
        <SaveBar saving={saving} saved={saved} error={error} />
      </div>
      <p className="mt-3 text-[12px] text-[#8A8FA3]">These methods appear in the Collect-payment form on every invoice.</p>
    </div>
  );
}

const NOTIF_ROWS = [
  ["invoiceSent", "Invoice sent", "When an invoice is created and sent."],
  ["paymentReceived", "Payment received", "When a customer payment is recorded."],
  ["invoiceOverdue", "Invoice overdue", "When an invoice passes its due date."],
  ["teamActivity", "Team activity", "Workspace member updates."],
];

function NotificationsTab({ initial }) {
  const [prefs, setPrefs] = useSyncedState({ ...(initial || {}) });
  const { save, saving, saved, error } = useSave("notifications");
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(prefs); }}>
      <h2 className="font-bold text-[19px]">Notifications settings</h2>
      <p className="mt-1 text-[13px] text-[#8A8FA3]">Choose the events you want to hear about.</p>
      <div className="mt-6 space-y-3 max-w-2xl">
        {NOTIF_ROWS.map(([k, label, sub]) => (
          <label key={k} className="flex items-center gap-3 rounded-xl bg-[#F6F7F9] px-5 py-4 cursor-pointer">
            <span className="flex-1">
              <span className="block text-[14.5px] font-bold">{label}</span>
              <span className="block text-[12px] text-[#8A8FA3]">{sub}</span>
            </span>
            <input type="checkbox" checked={!!prefs[k]} onChange={(e) => setPrefs((p) => ({ ...p, [k]: e.target.checked }))} className="h-5 w-5 accent-[#C4122F]" />
          </label>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-[#6B7280] max-w-2xl">Notification preferences are applied to in-app alerts. Email preferences will use your verified account address.</p>
      <div className="mt-4"><SaveBar saving={saving} saved={saved} error={error} /></div>
    </form>
  );
}

function SecurityTab() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const change = useChangePassword();
  const logoutAll = useLogoutEverywhere();

  async function submitPw(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      await change.mutateAsync({ current, next });
      setCurrent(""); setNext(""); setShowPw(false);
      setMsg("Password changed.");
    } catch (e2) { setErr(e2?.response?.data?.error || "Could not change password."); }
  }

  async function everywhere() {
    setMsg(""); setErr("");
    try {
      const r = await logoutAll.mutateAsync();
      if (r?.token) localStorage.setItem(TOKEN_KEY, r.token);
      setMsg("All other sessions signed out. This device stays signed in.");
    } catch (e2) { setErr(e2?.response?.data?.error || "Could not sign out other sessions."); }
  }

  const outline = "rounded-xl border border-[#F3C2C8] text-[#C4122F] font-semibold px-5 py-2.5 text-[14px] hover:bg-[#FFF1F2] disabled:opacity-60";

  return (
    <div>
      <h2 className="font-bold text-[19px]">Security settings</h2>
      <p className="mt-1 text-[13px] text-[#8A8FA3]">Password and active session controls.</p>
      <div className="mt-6 max-w-2xl rounded-xl bg-[#F6F7F9] px-5 py-4 text-[13.5px] text-[#475569]">
        Password changes and logout-all are managed securely from the security controls.
      </div>
      <div className="mt-4 flex flex-col items-start gap-3">
        <button onClick={() => { setShowPw((v) => !v); setMsg(""); setErr(""); }} className={outline}>Change password</button>
        {showPw && (
          <form onSubmit={submitPw} className="w-full max-w-md space-y-3.5 rounded-xl border border-[#ECECF0] p-5">
            <Field label="Current password"><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className={inputCls} /></Field>
            <Field label="New password (min 6)"><input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} className={inputCls} /></Field>
            <button disabled={change.isPending} className="rounded-xl bg-[#C4122F] text-white font-semibold px-5 py-2.5 text-[14px] disabled:opacity-60">
              {change.isPending ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
        <button onClick={() => { logout(); navigate("/login"); }} className={outline}>Log out</button>
        <button onClick={everywhere} disabled={logoutAll.isPending} className={outline}>
          {logoutAll.isPending ? "Signing out…" : "Log out everywhere"}
        </button>
      </div>
      {msg && <p className="mt-3 text-[13px] font-semibold text-[#16A34A]">{msg}</p>}
      {err && <p className="mt-3 text-[13px] font-semibold text-red-600">{err}</p>}
    </div>
  );
}

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const [tab, setTab] = useState("Profile");

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

        <Card className="p-7 min-h-[420px]">
          {isLoading && <p className="text-sm text-[#8A8FA3]">Loading settings…</p>}
          {!isLoading && tab === "Profile" && <ProfileTab />}
          {!isLoading && tab === "Business" && <BusinessTab initial={settings?.business} />}
          {!isLoading && tab === "Invoice" && <InvoiceTab initial={settings?.invoice} />}
          {!isLoading && tab === "Taxes" && <TaxesTab initial={settings?.taxes} />}
          {!isLoading && tab === "Payments" && <PaymentsTab initial={settings?.paymentMethods} />}
          {!isLoading && tab === "Notifications" && <NotificationsTab initial={settings?.notifications} />}
          {!isLoading && tab === "Security" && <SecurityTab />}
        </Card>
      </div>
    </div>
  );
}

// Re-exported for tests/smoke tooling.
export async function fetchSettings() {
  const { data } = await api.get("/api/settings");
  return data;
}
