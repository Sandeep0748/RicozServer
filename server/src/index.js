import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDb, isDbConnected } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.js";
import authRouter from "./routes/auth.js";
import orgRouter from "./routes/org.js";
import ticketsRouter from "./routes/tickets.js";
import customersRouter from "./routes/customers.js";
import kbRouter from "./routes/kb.js";
import dashboardRouter from "./routes/dashboard.js";
import invoicingRouter from "./routes/invoicing.js";
import { PLANS, TRIAL_DAYS } from "./config/plans.js";

const app = express();
// CORP must allow cross-origin: this is a cross-origin API by design
// (Vercel frontend -> Render backend). Helmet's default "same-origin"
// makes browsers block API responses even when CORS headers are correct.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((s) => s.trim()).filter(Boolean);
const vercelPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
app.use(
  cors({
    origin: (origin, cb) => {
      // No Origin header (curl, health checks, mobile apps) — allow.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin) || vercelPattern.test(origin) || localhostPattern.test(origin)) {
        return cb(null, true);
      }
      const err = new Error(`CORS blocked for origin ${origin}`);
      err.status = 403;
      return cb(err);
    },
    credentials: true,
  })
);

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "RicozServe API", mode: isDbConnected() ? "mongo" : "memory", time: new Date().toISOString() })
);
// Public plan catalog — powers the landing pricing table (no auth needed).
app.get("/api/plans", (_req, res) => res.json({ trialDays: TRIAL_DAYS, plans: PLANS }));
app.use("/api/auth", authRouter);
app.use("/api/org", orgRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/kb", kbRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api", invoicingRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDb(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`RicozServe API listening on :${PORT} (mode: ${isDbConnected() ? "mongo" : "memory"})`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(", ")} (+ https://*.vercel.app, http://localhost:*)`);
    if (!process.env.CLIENT_URL && process.env.NODE_ENV === "production") {
      console.warn("WARNING: CLIENT_URL is unset in production — browsers on your deployed frontend will be blocked by CORS. Set CLIENT_URL to your Vercel URL (comma-separated for multiple).");
    }
    if (!process.env.JWT_SECRET) {
      console.warn("WARNING: JWT_SECRET is unset — tokens are signed with an insecure dev fallback. Set JWT_SECRET in production.");
    }
    if (!process.env.MONGO_URI) {
      console.warn("WARNING: MONGO_URI is unset — running in memory mode, users/tickets reset on restart.");
    }
  });
});
