import { Router } from "express";
import { prisma } from "../../db.js";
import { getGroupData, listGroups } from "../../integrations/greenApi.js";
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

/**
 * Discovery: lists every WhatsApp group the linked number can see, by name,
 * so the owner can find their group's id without already knowing it.
 */
settingsRouter.get("/whatsapp-groups", async (_req, res) => {
  try {
    const groups = await listGroups();
    res.json(groups);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/** Verification: once a group id is set, confirms it's reachable and shows its live participants. */
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
