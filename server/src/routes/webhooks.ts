import { Router } from "express";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import { parseCardcomWebhook } from "../integrations/cardcom.js";
import { syncMember } from "../services/memberSync.js";

export const webhooksRouter = Router();

webhooksRouter.post("/cardcom/:secret", async (req, res) => {
  if (!config.cardcom.webhookSecret || req.params.secret !== config.cardcom.webhookSecret) {
    logger.warn("Rejected Cardcom webhook with invalid secret");
    return res.status(404).end();
  }

  const payload = req.body as Record<string, unknown>;

  await prisma.auditEvent.create({
    data: { type: "cardcom_raw", message: "Raw Cardcom webhook received", payload: JSON.stringify(payload) },
  });

  const event = parseCardcomWebhook(payload);

  if (!event.phone && !event.cardcomCustomerId) {
    logger.warn({ event }, "Cardcom webhook missing both phone and customer id - cannot match a member");
    return res.status(200).json({ ok: true, matched: false });
  }

  const member = await prisma.member.upsert({
    where: event.cardcomCustomerId
      ? { cardcomCustomerId: event.cardcomCustomerId }
      : { phone: event.phone! },
    create: {
      phone: event.phone ?? `unknown-${event.cardcomCustomerId}`,
      name: event.name,
      cardcomCustomerId: event.cardcomCustomerId,
      subscriptionStatus:
        event.type === "payment_success" ? "ACTIVE" : event.type === "subscription_cancelled" ? "CANCELLED" : "UNKNOWN",
      subscriptionStart: event.type === "payment_success" ? new Date() : undefined,
      lastPaymentAt: event.type === "payment_success" ? new Date() : undefined,
      lastPaymentAmount: event.amount ?? undefined,
    },
    update: {
      name: event.name ?? undefined,
      ...(event.type === "payment_success" && {
        subscriptionStatus: "ACTIVE",
        lastPaymentAt: new Date(),
        lastPaymentAmount: event.amount ?? undefined,
      }),
      ...(event.type === "subscription_cancelled" && { subscriptionStatus: "CANCELLED" }),
      ...(event.type === "payment_failed" && { subscriptionStatus: "EXPIRED" }),
    },
  });

  await prisma.auditEvent.create({
    data: {
      memberId: member.id,
      type: event.type,
      message: `Cardcom event "${event.type}" for ${member.name ?? member.phone}`,
    },
  });

  await syncMember(member);

  res.status(200).json({ ok: true, matched: true, memberId: member.id, event: event.type });
});
