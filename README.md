# RicozInvoice — Billing Workspace (Full-Stack v2)

RicozInvoice reference build (`ricoz.visualcode.site` screenshots). **Full-stack:** React frontend + Express + MongoDB API with JWT auth, INR-first (minor-units paise) billing.

## Structure
- `client/` — Vite + React 19 + Tailwind v4 + React Router + React Query + Lucide
- `server/` — Express + Mongoose + JWT/bcrypt (`memory` fallback when `MONGO_URI` is unset)

## Quickstart (local, no DB required)
```powershell
# API (memory mode)
cd server
npm install
npm run dev        # http://localhost:5000/api/health -> { ok:true, service:"RicozInvoice API", mode:"memory" }

# Frontend (new terminal)
cd client
npm install
npm run dev        # http://localhost:5173 — / landing, /login, /dashboard workspace
```
Login with seed admin `admin@ricoz.local / Admin123!` (memory mode) or sign up a new workspace.

## With MongoDB Atlas (persistent)
```powershell
cd server
copy .env.example .env   # fill MONGO_URI, JWT_SECRET, CLIENT_URL
npm run seed             # seeds admin + workspace
npm run dev
```

## Smooth customer journey (demo script)
1. `/signup` → new workspace (or login as admin)
2. `/dashboard` → Financial overview (empty) → **Add customer**
3. `/customers?action=new` → save customer
4. `/items?action=new` → save product/service (rate in ₹, GST %)
5. `/estimates?action=new` → create proposal → **Accept** → **Convert → Invoice**
6. `/invoices/:id` → **Record payment** (UPI/Card/Cash)
7. `/recurring-invoices` → automate repeat billing · `/expenses?action=new` → log billable spend
8. `/projects` + `/time-tracking` → delivery + billable hours
9. `/credit-notes` / `/debit-notes` → adjustments against invoices
10. `/reports` → Overview/Revenue/Expenses/Receivables/Tax filtered by date + customer
11. `/notifications` → workspace activity · `/team` → roles · `/settings` → Profile/Business/Invoice/Taxes/Payments/Notifications/Security
12. Back to `/dashboard` → billed / collected / outstanding / aging all updated.

## API
- `GET /api/health`
- `POST /api/auth/register|login` · `GET /api/auth/me` (Bearer JWT)
- `GET|POST /api/customers` · `GET /api/customers/:id`
- `GET|POST /api/items` · `DELETE /api/items/:id`
- `GET|POST /api/invoices` · `GET /api/invoices/:id` · `POST /api/invoices/:id/pay`
- `GET|POST /api/estimates` · `PATCH /api/estimates/:id` · `POST /api/estimates/:id/convert`
- `GET|POST /api/recurring` · `GET|POST /api/expenses|projects|time|credit-notes|debit-notes`
- `GET /api/overview` (cards, cashFlow, recentInvoices, recentPayments, aging)
- `GET /api/reports?type=overview|revenue|...&from&to&customer`
- `GET /api/notifications` · `POST /api/notifications/read-all`
- `GET /api/team` · `GET /api/settings`
- Legacy ticket/KB routes (`/api/tickets`, `/api/kb`, `/api/dashboard`) kept for backward compatibility.

## Routes (frontend)
- `/` Landing · `/login` · `/signup`
- `/dashboard` Overview · `/invoices` · `/invoices/:id` · `/estimates` · `/recurring-invoices` · `/customers` · `/items` · `/expenses` · `/projects` · `/time-tracking` · `/credit-notes` · `/debit-notes` · `/reports` · `/notifications` · `/team` · `/settings`
- All workspace routes require login (`ProtectedRoute`); React Query with empty-state fallback so UI never blanks when API is offline.

## Deploy
- API → Render/Fly: root `server/`, build `npm install`, start `npm start`, env `MONGO_URI, JWT_SECRET, CLIENT_URL`.
- Client → Vercel: root `client/`, build `npm run build`, env `VITE_API_URL=https://<api>/`.
- Atlas Network Access: allow `0.0.0.0/0` (or Render egress IPs).
