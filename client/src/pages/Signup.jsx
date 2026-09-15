import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Headset } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage, warmUpApi } from "../api/client";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { warmUpApi(); }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await register(name, email, password);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, "signup"));
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#FAFAFA] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-[#EAEAEA] bg-white p-8">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#C5002B] text-white"><Headset className="h-5 w-5" /></span>
          <span className="text-xl font-bold">RicozServe</span>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Create your workspace account</h1>
        <p className="mt-1 text-sm text-[#666]">Agents get ticket access immediately. First admin is seeded.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">{error}</p>}
        <label className="mt-5 block text-sm font-medium">Name
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-lg border border-[#DDD] px-3 py-2.5 outline-none focus:border-[#C5002B]" />
        </label>
        <label className="mt-3 block text-sm font-medium">Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full rounded-lg border border-[#DDD] px-3 py-2.5 outline-none focus:border-[#C5002B]" />
        </label>
        <label className="mt-3 block text-sm font-medium">Password (min 6)
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} className="mt-1 w-full rounded-lg border border-[#DDD] px-3 py-2.5 outline-none focus:border-[#C5002B]" />
        </label>
        <button disabled={busy} className="mt-5 w-full rounded-xl bg-[#111] text-white font-semibold py-3 disabled:opacity-60">
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="mt-4 text-sm text-[#666]">Have an account? <Link to="/login" className="font-semibold text-[#C5002B]">Sign in</Link></p>
      </form>
    </div>
  );
}
