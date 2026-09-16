import { Router } from "express";
import { prisma } from "../../db.js";
import { syncMember } from "../../services/memberSync.js";

export const membersRouter = Router();

membersRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const members = await prisma.member.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
  res.json(members);
});

membersRouter.get("/:id", async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { id: req.params.id },
    include: { events: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  if (!member) return res.status(404).json({ error: "Not found" });
  res.json(member);
});

/** Force a re-sync (add/remove in WhatsApp) for a single member, e.g. after manually editing their status. */
membersRouter.post("/:id/sync", async (req, res) => {
  const member = await prisma.member.findUnique({ where: { id: req.params.id } });
  if (!member) return res.status(404).json({ error: "Not found" });
  await syncMember(member);
  const updated = await prisma.member.findUnique({ where: { id: req.params.id } });
  res.json(updated);
});

/** Manual override, e.g. Noa marks someone active/cancelled by hand while the billing integration is being verified. */
membersRouter.patch("/:id", async (req, res) => {
  const { subscriptionStatus, name } = req.body as { subscriptionStatus?: string; name?: string };
  const allowed = ["ACTIVE", "CANCELLED", "EXPIRED", "TRIAL", "UNKNOWN"];
  if (subscriptionStatus && !allowed.includes(subscriptionStatus)) {
    return res.status(400).json({ error: `subscriptionStatus must be one of ${allowed.join(", ")}` });
  }
  const member = await prisma.member.update({
    where: { id: req.params.id },
    data: {
      ...(subscriptionStatus && { subscriptionStatus: subscriptionStatus as never }),
      ...(name !== undefined && { name }),
    },
  });
  await prisma.auditEvent.create({
    data: { memberId: member.id, type: "manual_edit", message: `Manually updated ${member.name ?? member.phone}` },
  });
  res.json(member);
});

/**
 * Manual CSV import fallback (columns: phone,name,status) for onboarding
 * the current member list before/while the Cardcom webhook is verified.
 */
membersRouter.post("/import-csv", async (req, res) => {
  const { csv } = req.body as { csv?: string };
  if (!csv) return res.status(400).json({ error: "Missing csv body field" });

  const lines = csv.trim().split("\n").filter(Boolean);
  const header = lines[0]?.toLowerCase().split(",").map((h) => h.trim());
  const startIdx = header?.[0] === "phone" ? 1 : 0;

  let imported = 0;
  const errors: string[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const [phoneRaw, name, status] = lines[i].split(",").map((v) => v?.trim());
    const phone = phoneRaw?.replace(/\D/g, "");
    if (!phone) {
      errors.push(`Line ${i + 1}: missing phone`);
      continue;
    }
    const subscriptionStatus = ["ACTIVE", "CANCELLED", "EXPIRED", "TRIAL"].includes((status ?? "").toUpperCase())
      ? (status!.toUpperCase() as "ACTIVE" | "CANCELLED" | "EXPIRED" | "TRIAL")
      : "ACTIVE";
    await prisma.member.upsert({
      where: { phone },
      create: { phone, name: name || null, subscriptionStatus },
      update: { name: name || undefined, subscriptionStatus },
    });
    imported++;
  }

  res.json({ imported, errors });
});
