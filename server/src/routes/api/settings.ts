import { Router } from "express";
import { prisma } from "../../db.js";
import { getGroupData } from "../../integrations/greenApi.js";
import { config } from "../../config.js";

export const settingsRouter = Router();

async function getSettings() {
  return prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
}

settingsRouter.get("/", async (_req, res) => {
  res.json(await getSettings());
});

settingsRouter.patch("/", async (req, res) => {
  const { whatsappGroupId, notifyEmail, notifyWhatsappPhone } = req.body as {
    whatsappGroupId?: string;
    notifyEmail?: string;
    notifyWhatsappPhone?: string;
  };
  const updated = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", whatsappGroupId, notifyEmail, notifyWhatsappPhone },
    update: { whatsappGroupId, notifyEmail, notifyWhatsappPhone },
  });
  res.json(updated);
});

/** Lists the WhatsApp groups the linked instance can see, to help pick WHATSAPP_GROUP_ID. */
settingsRouter.get("/whatsapp-group-preview", async (_req, res) => {
  const settings = await getSettings();
  const groupId = settings.whatsappGroupId || config.whatsappGroupId;
  if (!groupId) return res.status(400).json({ error: "No WhatsApp group id configured yet" });
  try {
    const data = await getGroupData(groupId);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
