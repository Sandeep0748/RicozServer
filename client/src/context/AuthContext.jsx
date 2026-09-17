import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { api, TOKEN_KEY } from "../api/client";

const LEGACY_KEY = "ricozinvoice.token";
function readToken() {
  try {
    const current = localStorage.getItem(TOKEN_KEY);
    if (current) return current;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      // Migrate RicozInvoice-era sessions to the RicozServe key.
      localStorage.setItem(TOKEN_KEY, legacy);
      return legacy;
    }
  } catch {
    // Ignore storage errors.
  }
  return null;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readToken();
    if (!token) { setLoading(false); return; }
    Promise.all([api.get("/api/auth/me"), api.get("/api/org").catch(() => null)])
      .then(([me, orgRes]) => {
        setUser(me.data);
        // /api/org returns { organization, plan, entitlements, trial, usage, ... }
        setOrg(orgRes?.data?.organization ? { ...orgRes.data.organization, planEffective: orgRes.data.plan, trial: orgRes.data.trial } : null);
      })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(LEGACY_KEY); setUser(null); setOrg(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password, workspace) => {
    const { data } = await api.post("/api/auth/login", { email, password, workspace });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    setOrg(data.organization || null);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password, workspace) => {
    const { data } = await api.post("/api/auth/register", { name, email, password, workspace });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    setOrg(data.organization || null);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_KEY);
    setUser(null);
    setOrg(null);
  }, []);

  // Re-fetch the signed-in profile (used after Profile settings save).
  const refresh = useCallback(async () => {
    const token = readToken();
    if (!token) return null;
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  return <AuthContext.Provider value={{ user, org, loading, login, register, logout, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
