import { Router, type Response } from "express";
import { prisma } from "../db.js";
import {
  AuthError,
  requestLoginCode,
  requireStudent,
  revokeSession,
  verifyLoginCode,
  type StudentRequest,
} from "../services/studentAuth.js";

/** Student-facing course API, authenticated by a WhatsApp login code. */
export const studentRouter = Router();

function handleAuthError(err: unknown, res: Response) {
  if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
  throw err;
}

studentRouter.post("/auth/request-code", async (req, res) => {
  try {
    await requestLoginCode(String(req.body?.phone ?? ""));
    res.json({ ok: true });
  } catch (err) {
    handleAuthError(err, res);
  }
});

studentRouter.post("/auth/verify", async (req, res) => {
  try {
    const token = await verifyLoginCode(String(req.body?.phone ?? ""), String(req.body?.code ?? ""));
    res.json({ token });
  } catch (err) {
    handleAuthError(err, res);
  }
});

studentRouter.use(requireStudent);

studentRouter.post("/auth/logout", async (req: StudentRequest, res) => {
  await revokeSession(req.sessionToken!);
  res.json({ ok: true });
});

async function profile(memberId: string) {
  const [member, totalLessons, completed] = await Promise.all([
    prisma.member.findUniqueOrThrow({ where: { id: memberId } }),
    prisma.lesson.count({ where: { published: true } }),
    prisma.lessonProgress.findMany({
      where: { memberId, lesson: { published: true } },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    }),
  ]);
  // Streak = consecutive days (ending today or yesterday) with at least one completed lesson.
  const days = new Set(completed.map((c) => c.completedAt.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return {
    name: member.name,
    phone: member.phone,
    memberSince: member.subscriptionStart ?? member.createdAt,
    subscriptionEnd: member.subscriptionEnd,
    totalLessons,
    completedLessons: completed.length,
    streakDays: streak,
    lastPracticeAt: completed[0]?.completedAt ?? null,
  };
}

studentRouter.get("/me", async (req: StudentRequest, res) => {
  res.json(await profile(req.member!.id));
});

studentRouter.patch("/me", async (req: StudentRequest, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 80) : undefined;
  if (name !== undefined) await prisma.member.update({ where: { id: req.member!.id }, data: { name: name || null } });
  res.json(await profile(req.member!.id));
});

studentRouter.get("/course", async (req: StudentRequest, res) => {
  const [modules, done] = await Promise.all([
    prisma.courseModule.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        lessons: {
          where: { published: true },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: { id: true, title: true, description: true, videoUrl: true, durationMin: true },
        },
      },
    }),
    prisma.lessonProgress.findMany({ where: { memberId: req.member!.id }, select: { lessonId: true } }),
  ]);
  const doneIds = new Set(done.map((d) => d.lessonId));
  res.json(
    modules
      .filter((m) => m.lessons.length > 0)
      .map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        lessons: m.lessons.map((l) => ({ ...l, completed: doneIds.has(l.id) })),
      })),
  );
});

studentRouter.put("/lessons/:id/progress", async (req: StudentRequest, res) => {
  const lesson = await prisma.lesson.findFirst({ where: { id: req.params.id, published: true } });
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  const memberId = req.member!.id;
  if (req.body?.completed === false) {
    await prisma.lessonProgress.deleteMany({ where: { memberId, lessonId: lesson.id } });
  } else {
    await prisma.lessonProgress.upsert({
      where: { memberId_lessonId: { memberId, lessonId: lesson.id } },
      create: { memberId, lessonId: lesson.id },
      update: {},
    });
  }
  res.json({ ok: true });
});
