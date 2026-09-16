import nodemailer from "nodemailer";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import { sendMessage, phoneToChatId } from "../integrations/greenApi.js";

async function buildDigestText(): Promise<string> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [active, cancelledEvents, addedEvents, removedEvents, errors, revenueAgg] = await Promise.all([
    prisma.member.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.auditEvent.count({ where: { type: "subscription_cancelled", createdAt: { gte: since } } }),
    prisma.auditEvent.count({ where: { type: "added_to_group", createdAt: { gte: since } } }),
    prisma.auditEvent.count({ where: { type: "removed_from_group", createdAt: { gte: since } } }),
    prisma.member.count({ where: { groupStatus: "ERROR" } }),
    prisma.member.aggregate({ _sum: { lastPaymentAmount: true }, where: { subscriptionStatus: "ACTIVE" } }),
  ]);

  const lines = [
    `סיכום יומי - קבוצת יוגה פנים`,
    `חברות פעילות: ${active}`,
    `הצטרפו לקבוצה ב-24 שעות אחרונות: ${addedEvents}`,
    `הוסרו מהקבוצה ב-24 שעות אחרונות: ${removedEvents}`,
    `ביטולי מנוי ב-24 שעות אחרונות: ${cancelledEvents}`,
    `הכנסה חודשית משוערת מחברות פעילות: ${(revenueAgg._sum.lastPaymentAmount ?? 0).toLocaleString("he-IL")} ₪`,
  ];
  if (errors > 0) {
    lines.push(`⚠️ ${errors} חברות עם שגיאת סנכרון בוואטסאפ - כדאי לבדוק בדשבורד`);
  }
  return lines.join("\n");
}

export async function sendDailyDigest(): Promise<void> {
  const text = await buildDigestText();

  if (config.notify.emailTo && config.notify.smtpHost) {
    try {
      const transporter = nodemailer.createTransport({
        host: config.notify.smtpHost,
        port: config.notify.smtpPort,
        secure: config.notify.smtpPort === 465,
        auth: config.notify.smtpUser ? { user: config.notify.smtpUser, pass: config.notify.smtpPass } : undefined,
      });
      await transporter.sendMail({
        from: config.notify.smtpUser || "yogaface-bot@localhost",
        to: config.notify.emailTo,
        subject: "סיכום יומי - קבוצת יוגה פנים",
        text,
      });
      logger.info("Daily digest emailed");
    } catch (err) {
      logger.error({ err }, "Failed to send digest email");
    }
  }

  if (config.notify.whatsappPhone) {
    try {
      await sendMessage(phoneToChatId(config.notify.whatsappPhone), text);
      logger.info("Daily digest sent via WhatsApp");
    } catch (err) {
      logger.error({ err }, "Failed to send digest WhatsApp message");
    }
  }
}
