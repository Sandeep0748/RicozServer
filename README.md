# RicozServe — Unified Customer Service Platform (Full-Stack v1)

Zoho Desk / Zendesk / Freshdesk-inspired build. **Full-stack:** React frontend + Express + MongoDB API with JWT auth.

## Structure
- `client/` — Vite + React 19 + Tailwind v4 + React Router + React Query + Recharts + Lucide
- `server/` — Express + Mongoose + JWT/bcrypt (`memory` fallback when `MONGO_URI` is unset)

## Quickstart (local, no DB required)
```powershell
# API (memory mode)
cd server
npm install
npm run dev        # http://localhost:5000/api/health -> { ok:true, mode:"memory" }

# Frontend (new terminal)
cd client
npm install
npm run dev        # http://localhost:5173 — / landing, /login, /app dashboard
```
Login with seed admin `admin@ricoz.local / Admin123!` (memory mode) or sign up a new agent.

## With MongoDB Atlas (persistent)
```powershell
cd server
copy .env.example .env   # fill MONGO_URI, JWT_SECRET, CLIENT_URL
npm run seed             # seeds admin + agents + customers + tickets + KB
npm run dev
```

## API
- `GET /api/health`
- `POST /api/auth/register|login` · `GET /api/auth/me` (Bearer JWT)
- `GET|POST /api/tickets` · `GET|PATCH /api/tickets/:id` (`:id` = `RC-XXXX` or mongo id) · `POST /api/tickets/:id/replies`
- `GET|POST /api/customers` · `GET /api/customers/:id` (360 + tickets)
- `GET|POST /api/kb` · `GET /api/kb/:id` (views++) · `POST /api/kb/:id/helpful`
- `GET /api/dashboard/summary` (stats, volume, CSAT, channels, funnel, needsAttention, slaPolicies)
- Smoke: `npm run smoke` (starts server first) or `API_URL=http://localhost:5000 npm run smoke`

## Routes (frontend)
- `/` Landing · `/login` · `/signup` · `/app` Overview · `/app/tickets` · `/app/tickets/:id` · `/app/knowledge` · `/app/routing` · `/app/analytics` · `/app/customers` · `/app/settings`
- `/app/*` requires login (`ProtectedRoute`); React Query with mock fallback so UI never blanks when API is offline.

## Deploy
- API → Render/Fly: root `server/`, build `npm install`, start `npm start`, env `MONGO_URI, JWT_SECRET, CLIENT_URL`.
- Client → Vercel: root `client/`, build `npm run build`, env `VITE_API_URL=https://<api>/`.
- Atlas Network Access: allow `0.0.0.0/0` (or Render egress IPs).

## What's next (out of v1 scope)
- Socket.io live chat, AI draft endpoint, SLA breach cron + escalation webhooks, automation rule engine execution.
