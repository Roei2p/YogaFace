import { Router } from "express";
import { prisma } from "../../db.js";

/** Dashboard (owner) management of course modules and lessons. */
export const courseAdminRouter = Router();

const VIDEO_HOSTS = /^(www\.|player\.)?(youtube\.com|youtu\.be|vimeo\.com)$/;

function validVideoUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && VIDEO_HOSTS.test(url.hostname);
  } catch {
    return false;
  }
}

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v.trim() : undefined;
}

courseAdminRouter.get("/", async (_req, res) => {
  const modules = await prisma.courseModule.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      lessons: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: { _count: { select: { progress: true } } },
      },
    },
  });
  res.json(modules);
});

courseAdminRouter.post("/modules", async (req, res) => {
  const title = str(req.body?.title);
  if (!title) return res.status(400).json({ error: "חסרה כותרת לפרק" });
  const count = await prisma.courseModule.count();
  res.json(await prisma.courseModule.create({ data: { title, description: str(req.body?.description) || null, order: count } }));
});

courseAdminRouter.patch("/modules/:id", async (req, res) => {
  const { title, description, order } = req.body ?? {};
  res.json(
    await prisma.courseModule.update({
      where: { id: req.params.id },
      data: {
        title: str(title) || undefined,
        description: description === undefined ? undefined : str(description) || null,
        order: typeof order === "number" ? order : undefined,
      },
    }),
  );
});

courseAdminRouter.delete("/modules/:id", async (req, res) => {
  await prisma.courseModule.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

courseAdminRouter.post("/lessons", async (req, res) => {
  const { moduleId, title, description, videoUrl, durationMin, published } = req.body ?? {};
  if (!str(title)) return res.status(400).json({ error: "חסרה כותרת לשיעור" });
  if (!validVideoUrl(videoUrl)) return res.status(400).json({ error: "יש להדביק קישור YouTube או Vimeo תקין" });
  const order = await prisma.lesson.count({ where: { moduleId } });
  res.json(
    await prisma.lesson.create({
      data: {
        moduleId,
        title: str(title)!,
        description: str(description) || null,
        videoUrl,
        durationMin: typeof durationMin === "number" ? durationMin : null,
        published: published !== false,
        order,
      },
    }),
  );
});

courseAdminRouter.patch("/lessons/:id", async (req, res) => {
  const { title, description, videoUrl, durationMin, published, order } = req.body ?? {};
  if (videoUrl !== undefined && !validVideoUrl(videoUrl)) {
    return res.status(400).json({ error: "יש להדביק קישור YouTube או Vimeo תקין" });
  }
  res.json(
    await prisma.lesson.update({
      where: { id: req.params.id },
      data: {
        title: str(title) || undefined,
        description: description === undefined ? undefined : str(description) || null,
        videoUrl,
        durationMin: durationMin === undefined ? undefined : typeof durationMin === "number" ? durationMin : null,
        published: typeof published === "boolean" ? published : undefined,
        order: typeof order === "number" ? order : undefined,
      },
    }),
  );
});

courseAdminRouter.delete("/lessons/:id", async (req, res) => {
  await prisma.lesson.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
