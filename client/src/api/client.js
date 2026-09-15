import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const TOKEN_KEY = "ricozserve.token";

export const api = axios.create({ baseURL: API_URL, timeout: 12000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
