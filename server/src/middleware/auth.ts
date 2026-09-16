import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export function requireDashboardAuth(req: Request, res: Response, next: NextFunction) {
  if (!config.dashboardApiToken) {
    return res.status(500).json({ error: "DASHBOARD_API_TOKEN is not configured on the server" });
  }
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token !== config.dashboardApiToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
