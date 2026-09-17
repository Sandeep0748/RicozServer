import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

const get = (url, params) => api.get(url, { params }).then((r) => r.data);
const STALE = 15_000;

function listHook(key, url) {
  return (filters = {}) => useQuery({ queryKey: [key, filters], queryFn: () => get(url, filters), retry: 1, staleTime: STALE });
}

export const useOverview = () => useQuery({ queryKey: ["overview"], queryFn: () => get("/api/overview"), retry: 1, staleTime: STALE });
export const useInvoices = listHook("invoices", "/api/invoices");
export const useEstimates = listHook("estimates", "/api/estimates");
export const useRecurring = listHook("recurring", "/api/recurring");
export const useItems = listHook("items", "/api/items");
export const useExpenses = listHook("expenses", "/api/expenses");
export const useProjects = listHook("projects", "/api/projects");
export const useTimeEntries = listHook("time", "/api/time");
export const useCreditNotes = listHook("credit-notes", "/api/credit-notes");
export const useDebitNotes = listHook("debit-notes", "/api/debit-notes");
export const useNotifications = listHook("notifications", "/api/notifications");
export const useTeam = () => useQuery({ queryKey: ["team"], queryFn: () => get("/api/team"), retry: 1, staleTime: 30_000 });
export const useSettings = () => useQuery({ queryKey: ["settings"], queryFn: () => get("/api/settings"), retry: 1, staleTime: 60_000 });
export const useReports = (filters = {}) => useQuery({ queryKey: ["reports", filters], queryFn: () => get("/api/reports", filters), retry: 1, staleTime: STALE });
export const useInvoice = (id) => useQuery({ queryKey: ["invoice", id], queryFn: () => get(`/api/invoices/${id}`), enabled: !!id, retry: 1 });

function useMut(postFn, invalidates) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postFn,
    onSuccess: () => invalidates.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}

export function useCreateCustomer() { const qc = useQueryClient(); return useMutation({ mutationFn: (p) => api.post("/api/customers", p).then((r) => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); qc.invalidateQueries({ queryKey: ["overview"] }); } }); }
export function useCustomersQ(filters = {}) {
  return useQuery({ queryKey: ["customers", filters], queryFn: () => get("/api/customers", filters), retry: 1, staleTime: STALE });
}
export function useCreateInvoice() { return useMut((p) => api.post("/api/invoices", p).then((r) => r.data), ["invoices", "overview", "reports", "notifications"]); }
export function usePayInvoice(id) { const qc = useQueryClient(); return useMutation({ mutationFn: (p) => api.post(`/api/invoices/${id}/pay`, p).then((r) => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["invoice", id] }); qc.invalidateQueries({ queryKey: ["overview"] }); qc.invalidateQueries({ queryKey: ["reports"] }); } }); }
export function useCreateEstimate() { return useMut((p) => api.post("/api/estimates", p).then((r) => r.data), ["estimates", "overview"]); }
export function useConvertEstimate() { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => api.post(`/api/estimates/${typeof id === "object" ? id.id : id}/convert`).then((r) => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["estimates"] }); qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["overview"] }); } }); }
export function usePatchEstimate() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...p }) => api.patch(`/api/estimates/${id}`, p).then((r) => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["estimates"] }); qc.invalidateQueries({ queryKey: ["overview"] }); } }); }
export function useCreateItem() { return useMut((p) => api.post("/api/items", p).then((r) => r.data), ["items"]); }
export function useDeleteItem() { return useMut((id) => api.delete(`/api/items/${id}`).then((r) => r.data), ["items"]); }
export function useCreateExpense() { return useMut((p) => api.post("/api/expenses", p).then((r) => r.data), ["expenses", "overview", "reports"]); }
export function useCreateProject() { return useMut((p) => api.post("/api/projects", p).then((r) => r.data), ["projects"]); }
export function useCreateTime() { return useMut((p) => api.post("/api/time", p).then((r) => r.data), ["time", "overview"]); }
export function useCreateRecurring() { return useMut((p) => api.post("/api/recurring", p).then((r) => r.data), ["recurring"]); }
export function useCreateCredit() { return useMut((p) => api.post("/api/credit-notes", p).then((r) => r.data), ["credit-notes", "overview"]); }
export function useCreateDebit() { return useMut((p) => api.post("/api/debit-notes", p).then((r) => r.data), ["debit-notes", "overview"]); }
export function useReadAllNotifications() { return useMut(() => api.post("/api/notifications/read-all").then((r) => r.data), ["notifications"]); }
