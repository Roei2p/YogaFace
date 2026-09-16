import { Router } from "express";
import { prisma } from "../../db.js";

export const auditRouter = Router();

auditRouter.get("/", async (req, res) => {
  const take = Math.min(Number(req.query.take ?? 100), 500);
  const events = await prisma.auditEvent.findMany({
    where: { type: { not: "cardcom_raw" } },
    orderBy: { createdAt: "desc" },
    take,
    include: { member: { select: { name: true, phone: true } } },
  });
  res.json(events);
});
