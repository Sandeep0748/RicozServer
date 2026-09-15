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
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((s) => s.trim()),
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
  app.listen(PORT, () => console.log(`RicozServe API listening on :${PORT} (mode: ${isDbConnected() ? "mongo" : "memory"})`));
});
