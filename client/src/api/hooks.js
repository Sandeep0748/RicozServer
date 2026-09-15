import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

const get = (url, params) => api.get(url, { params }).then((r) => r.data);

// ---------- Dashboard ----------
export function useDashboard() {
  return useQuery({ queryKey: ["dashboard"], queryFn: () => get("/api/dashboard/summary"), retry: 1, staleTime: 30_000 });
}

// ---------- Tickets ----------
export function useTickets(filters = {}) {
  const { status, priority, channel, search, page = 1, limit = 20 } = filters;
  return useQuery({
    queryKey: ["tickets", status, priority, channel, search, page, limit],
    queryFn: () => get("/api/tickets", { status, priority, channel, search, page, limit }),
    retry: 1,
    staleTime: 15_000,
  });
}

export function useTicket(id) {
  return useQuery({ queryKey: ["ticket", id], queryFn: () => get(`/api/tickets/${id}`), enabled: !!id, retry: 1 });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/api/tickets", payload).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tickets"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
}

export function usePatchTicket(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.patch(`/api/tickets/${id}`, payload).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ticket", id] }); qc.invalidateQueries({ queryKey: ["tickets"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
}

export function useReplyTicket(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(`/api/tickets/${id}/replies`, payload).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ticket", id] }); qc.invalidateQueries({ queryKey: ["tickets"] }); },
  });
}

// ---------- Customers ----------
export function useCustomers({ search, page = 1, limit = 20 } = {}) {
  return useQuery({ queryKey: ["customers", search, page, limit], queryFn: () => get("/api/customers", { search, page, limit }), retry: 1, staleTime: 30_000 });
}

export function useCustomer(id) {
  return useQuery({ queryKey: ["customer", id], queryFn: () => get(`/api/customers/${id}`), enabled: !!id, retry: 1 });
}

// ---------- Knowledge base ----------
export function useArticles({ q, category } = {}) {
  return useQuery({ queryKey: ["kb", q, category], queryFn: () => get("/api/kb", { q, category }), retry: 1, staleTime: 30_000 });
}
