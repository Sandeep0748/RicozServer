import axios from "axios";

// Strip trailing slashes so VITE_API_URL works with or without them.
// Expected shape: https://<api-host> (no /api suffix — endpoints add it).
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
export const TOKEN_KEY = "ricozserve.token";

const isBrowser = typeof window !== "undefined";
const isLocalHostApi = /^(http:\/\/localhost|http:\/\/127\.)/i.test(API_URL);
if (isBrowser && isLocalHostApi && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
  // Production build still pointing at localhost — the classic "works locally,
  // fails when deployed" cause. Surface loudly in the console.
  console.warn(
    `[RicozServe] VITE_API_URL points at localhost (${API_URL}) but the app runs on ${window.location.hostname}. ` +
      "Set VITE_API_URL to your deployed API URL on Vercel (Production) and redeploy."
  );
}

// Render free tier can sleep ~50s; first request after idle often exceeds 12s.
export const api = axios.create({ baseURL: API_URL, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Retry once on timeout / network blip (e.g. Render cold start waking up).
// Safe for auth: a duplicated register surfaces as 409 "Email already registered",
// which the UI reports and the user can then sign in.
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err?.config;
    const retriable = !err?.response && (err?.code === "ECONNABORTED" || err?.code === "ERR_NETWORK");
    if (config && retriable && !config._retry) {
      config._retry = true;
      return api(config);
    }
    throw err;
  }
);

/** Best-effort warm-up ping so cold starts happen before the user submits. */
export function warmUpApi() {
  return api.get("/api/health", { timeout: 15000 }).catch(() => null);
}

/**
 * Turn an axios auth error into a message that tells the user (and deployer)
 * what actually went wrong instead of a generic "Is the API running?".
 */
export function getAuthErrorMessage(err, action = "login") {
  const serverMsg = err?.response?.data?.error;
  if (serverMsg) return serverMsg;

  const status = err?.response?.status;
  if (status === 404) return `${action === "signup" ? "Signup" : "Login"} failed: API route not found (check VITE_API_URL has no /api suffix).`;
  if (status) return `${action === "signup" ? "Signup" : "Login"} failed (HTTP ${status}).`;

  if (err?.code === "ECONNABORTED" || /timeout/i.test(err?.message || "")) {
    return "Request timed out — the free-tier API may be waking from sleep. Wait ~30s and try again.";
  }

  if (err?.code === "ERR_NETWORK") {
    if (isLocalHostApi && isBrowser && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return `Cannot reach API at ${API_URL} from this site. VITE_API_URL still points at localhost — set it to your deployed API URL on Vercel (Production) and redeploy.`;
    }
    return `Cannot reach the API at ${API_URL}. If this is the deployed site, the API may be asleep (wait and retry) or blocking this origin via CORS (Render CLIENT_URL must include ${isBrowser ? window.location.origin : "this site"}).`;
  }

  return `${action === "signup" ? "Signup" : "Login"} failed. Is the API running at ${API_URL}?`;
}

export function isApiError(err) {
  return !!err?.response || err?.code === "ERR_NETWORK";
}

export async function unwrap(promise, fallback) {
  try {
    const { data } = await promise;
    return { data, live: true };
  } catch (err) {
    if (fallback !== undefined) return { data: fallback, live: false, error: err };
    throw err;
  }
}
