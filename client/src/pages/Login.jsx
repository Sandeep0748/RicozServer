import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage, warmUpApi } from "../api/client";
import AuthLayout, { AUTH_BUTTON, AUTH_INPUT, AUTH_LABEL } from "../components/auth/AuthLayout";

const DEMO_EMAIL = "admin@ricoz.local";
const DEMO_PASSWORD = "Admin123!";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { warmUpApi(); }, []);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await login(email, password, workspace || undefined);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, "login"));
    } finally { setBusy(false); }
  }

  return (
    <AuthLayout
      eyebrow="Billing, without the chaos"
      title="Welcome back"
      sub="Sign in to keep your business moving."
      footer={
        <>
          New to RicozServe?{" "}
          <Link to="/signup" className="font-bold text-[#C4122F]">Create an account</Link>
          <span className="mx-2 text-[#CBD2DC]">·</span>
          <Link to="/" className="font-semibold text-[#475569]">Back home</Link>
        </>
      }
    >
      <form onSubmit={submit}>
        {error && <p className="mt-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-3.5 py-2.5">{error}</p>}
        <label className={`${AUTH_LABEL} mt-5`}>Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" placeholder="you@company.com" className={AUTH_INPUT} />
        </label>
        <label className={`${AUTH_LABEL} mt-4`}>Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" placeholder="••••••••" className={AUTH_INPUT} />
        </label>

        <button
          type="button"
          onClick={() => setShowWorkspace((v) => !v)}
          className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#C4122F]"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition ${showWorkspace ? "rotate-180" : ""}`} />
          {showWorkspace ? "Hide workspace field" : "Signing in to a specific workspace?"}
        </button>
        {showWorkspace && (
          <label className={`${AUTH_LABEL} mt-3`}>Workspace
            <input value={workspace} onChange={(e) => setWorkspace(e.target.value)} placeholder="acme-support" autoComplete="organization" className={AUTH_INPUT} />
          </label>
        )}

        <button disabled={busy} className={AUTH_BUTTON}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-4 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F6F7F9] px-4 py-3">
        <p className="text-[13px] text-[#475569]">
          Demo admin: <code className="font-semibold text-[#111827]">{DEMO_EMAIL} / {DEMO_PASSWORD}</code>
        </p>
        <button type="button" onClick={fillDemo} className="mt-1 text-[13px] font-bold text-[#C4122F]">
          Fill demo credentials →
        </button>
      </div>
    </AuthLayout>
  );
}
