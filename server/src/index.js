import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDb, isDbConnected } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.js";
import authRouter from "./routes/auth.js";
import ticketsRouter from "./routes/tickets.js";
import customersRouter from "./routes/customers.js";
import kbRouter from "./routes/kb.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "RicozServe API", mode: isDbConnected() ? "mongo" : "memory", time: new Date().toISOString() })
);
app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/kb", kbRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDb(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`RicozServe API listening on :${PORT} (mode: ${isDbConnected() ? "mongo" : "memory"})`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
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
