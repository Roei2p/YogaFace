import { Router } from "express";
import { prisma } from "../../db.js";

export const cardcomLogRouter = Router();

/**
 * Raw Cardcom webhook payloads, for diagnosing/verifying the field mapping
 * in integrations/cardcom.ts against what Cardcom actually sends - see
 * README.md "סליקה - Cardcom".
 */
cardcomLogRouter.get("/", async (req, res) => {
  const take = Math.min(Number(req.query.take ?? 20), 100);
  const events = await prisma.auditEvent.findMany({
    where: { type: "cardcom_raw" },
    orderBy: { createdAt: "desc" },
    take,
  });
  res.json(
    events.map((e) => ({
      id: e.id,
      createdAt: e.createdAt,
      payload: e.payload ? JSON.parse(e.payload) : null,
    })),
  );
});
