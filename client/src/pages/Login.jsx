import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage, warmUpApi } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@ricoz.local");
  const [password, setPassword] = useState("Admin123!");
  const [workspace, setWorkspace] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { warmUpApi(); }, []);

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
    <div className="min-h-screen grid place-items-center bg-[#FAFAFA] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-[#EAEAEA] bg-white p-8">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#C4122F] text-white font-extrabold">R</span>
          <span className="text-xl font-extrabold">Ricoz<span className="text-[#6B7280] font-semibold">Serve</span></span>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-[#666]">Sign in to your workspace. Demo admin: <code>admin@ricoz.local / Admin123!</code></p>
        {error && <p className="mt-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">{error}</p>}
        <label className="mt-5 block text-sm font-medium">Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full rounded-lg border border-[#DDD] px-3 py-2.5 outline-none focus:border-[#C5002B]" />
        </label>
        <label className="mt-3 block text-sm font-medium">Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 w-full rounded-lg border border-[#DDD] px-3 py-2.5 outline-none focus:border-[#C5002B]" />
        </label>
        <label className="mt-3 block text-sm font-medium">Workspace <span className="font-normal text-[#888]">(only if your email is in several)</span>
          <input value={workspace} onChange={(e) => setWorkspace(e.target.value)} placeholder="acme-support" className="mt-1 w-full rounded-lg border border-[#DDD] px-3 py-2.5 outline-none focus:border-[#C5002B]" />
        </label>
        <button disabled={busy} className="mt-5 w-full rounded-xl bg-[#C5002B] hover:bg-[#A30024] text-white font-semibold py-3 disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-sm text-[#666]">No account? <Link to="/signup" className="font-semibold text-[#C5002B]">Create one</Link> · <Link to="/" className="font-semibold">Back home</Link></p>
      </form>
    </div>
  );
}
