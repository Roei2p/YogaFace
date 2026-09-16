import { Router } from "express";
import { prisma } from "../../db.js";

export const statsRouter = Router();

statsRouter.get("/", async (_req, res) => {
  const [active, cancelled, expired, trial, inGroup, totalMembers] = await Promise.all([
    prisma.member.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.member.count({ where: { subscriptionStatus: "CANCELLED" } }),
    prisma.member.count({ where: { subscriptionStatus: "EXPIRED" } }),
    prisma.member.count({ where: { subscriptionStatus: "TRIAL" } }),
    prisma.member.count({ where: { groupStatus: "IN_GROUP" } }),
    prisma.member.count(),
  ]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [newLast30d, cancelledLast30d, revenueAgg] = await Promise.all([
    prisma.member.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.auditEvent.count({ where: { type: "subscription_cancelled", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.member.aggregate({
      _sum: { lastPaymentAmount: true },
      where: { subscriptionStatus: "ACTIVE" },
    }),
  ]);

  const syncErrors = await prisma.member.count({ where: { groupStatus: "ERROR" } });

  res.json({
    totalMembers,
    active,
    trial,
    cancelled,
    expired,
    inGroup,
    newLast30d,
    cancelledLast30d,
    estimatedMrr: revenueAgg._sum.lastPaymentAmount ?? 0,
    syncErrors,
  });
});

statsRouter.get("/timeseries", async (_req, res) => {
  const events = await prisma.auditEvent.findMany({
    where: { type: { in: ["added_to_group", "removed_from_group"] } },
    orderBy: { createdAt: "asc" },
    select: { type: true, createdAt: true },
  });

  const byDay = new Map<string, { added: number; removed: number }>();
  for (const e of events) {
    const day = e.createdAt.toISOString().slice(0, 10);
    const entry = byDay.get(day) ?? { added: 0, removed: 0 };
    if (e.type === "added_to_group") entry.added++;
    else entry.removed++;
    byDay.set(day, entry);
  }

  const days = [...byDay.keys()].sort();
  let running = 0;
  const series = days.map((day) => {
    const { added, removed } = byDay.get(day)!;
    running += added - removed;
    return { day, added, removed, groupSize: running };
  });

  res.json(series);
});
