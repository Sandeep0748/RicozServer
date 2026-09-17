import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import WorkspaceLayout from "./layouts/WorkspaceLayout";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Overview = lazy(() => import("./pages/Overview"));
const Invoices = lazy(() => import("./pages/Invoices"));
const InvoiceDetail = lazy(() => import("./pages/InvoiceDetail"));
const Estimates = lazy(() => import("./pages/Estimates"));
const Recurring = lazy(() => import("./pages/Recurring"));
const Customers = lazy(() => import("./pages/Customers"));
const Items = lazy(() => import("./pages/Items"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Projects = lazy(() => import("./pages/Projects"));
const TimeTracking = lazy(() => import("./pages/TimeTracking"));
const CreditNotes = lazy(() => import("./pages/CreditNotes"));
const DebitNotes = lazy(() => import("./pages/DebitNotes"));
const Reports = lazy(() => import("./pages/Reports"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Team = lazy(() => import("./pages/Team"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient();

function PageFallback() {
  return <div className="min-h-screen grid place-items-center text-sm text-[#666]">Loading…</div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<ProtectedRoute><WorkspaceLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<Overview />} />
                <Route path="overview" element={<Navigate to="/dashboard" replace />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices/:id" element={<InvoiceDetail />} />
                <Route path="estimates" element={<Estimates />} />
                <Route path="recurring-invoices" element={<Recurring />} />
                <Route path="recurring" element={<Navigate to="/recurring-invoices" replace />} />
                <Route path="customers" element={<Customers />} />
                <Route path="items" element={<Items />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="projects" element={<Projects />} />
                <Route path="time-tracking" element={<TimeTracking />} />
                <Route path="credit-notes" element={<CreditNotes />} />
                <Route path="debit-notes" element={<DebitNotes />} />
                <Route path="reports" element={<Reports />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="team" element={<Team />} />
                <Route path="settings" element={<Settings />} />
                <Route path="app" element={<Navigate to="/dashboard" replace />} />
                <Route path="app/*" element={<Navigate to="/dashboard" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
