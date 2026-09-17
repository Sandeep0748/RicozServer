import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage, warmUpApi } from "../api/client";
import AuthLayout, { AUTH_BUTTON, AUTH_INPUT, AUTH_LABEL } from "../components/auth/AuthLayout";

export default function Signup() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { warmUpApi(); }, []);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await register(name, email, password, workspace);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, "signup"));
    } finally { setBusy(false); }
  }

  return (
    <AuthLayout
      eyebrow="Billing, without the chaos"
      title="Create your workspace"
      sub="Start sending polished invoices in minutes. 14-day Pro trial included."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-[#C4122F]">Sign in</Link>
        </>
      }
    >
      <form onSubmit={submit}>
        {error && <p className="mt-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-3.5 py-2.5">{error}</p>}
        <label className={`${AUTH_LABEL} mt-5`}>Workspace name
          <input value={workspace} onChange={(e) => setWorkspace(e.target.value)} placeholder="Acme Support" autoComplete="organization" className={AUTH_INPUT} />
        </label>
        <label className={`${AUTH_LABEL} mt-4`}>Your name
          <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" placeholder="Aarav Sharma" className={AUTH_INPUT} />
        </label>
        <label className={`${AUTH_LABEL} mt-4`}>Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" placeholder="you@company.com" className={AUTH_INPUT} />
        </label>
        <label className={`${AUTH_LABEL} mt-4`}>Password (min 6)
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} autoComplete="new-password" placeholder="••••••••" className={AUTH_INPUT} />
        </label>
        <button disabled={busy} className={AUTH_BUTTON}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
