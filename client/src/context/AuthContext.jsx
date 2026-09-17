import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { api, TOKEN_KEY } from "../api/client";

const LEGACY_KEY = "ricozserve.token";
function readToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_KEY);
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

  return <AuthContext.Provider value={{ user, org, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
