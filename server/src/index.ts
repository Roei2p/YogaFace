import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { requireDashboardAuth } from "./middleware/auth.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { statsRouter } from "./routes/api/stats.js";
import { membersRouter } from "./routes/api/members.js";
import { auditRouter } from "./routes/api/audit.js";
import { settingsRouter } from "./routes/api/settings.js";
import { insightsRouter } from "./routes/api/insights.js";
import { startCronJobs } from "./jobs/cronJobs.js";

const app = express();

app.use(cors());
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => res.json({ ok: true }));

// Cardcom posts here directly - authenticated by a secret in the URL path
// instead of a bearer token, since Cardcom cannot send custom headers.
app.use("/webhooks", webhooksRouter);

// Everything under /api is the dashboard's backend and requires the
// dashboard token.
app.use("/api/stats", requireDashboardAuth, statsRouter);
app.use("/api/members", requireDashboardAuth, membersRouter);
app.use("/api/audit-log", requireDashboardAuth, auditRouter);
app.use("/api/settings", requireDashboardAuth, settingsRouter);
app.use("/api/insights", requireDashboardAuth, insightsRouter);

app.listen(config.port, () => {
  logger.info(`YogaFace server listening on port ${config.port}`);
  startCronJobs();
});
