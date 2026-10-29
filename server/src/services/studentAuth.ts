import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { Member } from "@prisma/client";
import { prisma } from "../db.js";
import { phoneToChatId, sendMessage } from "../integrations/greenApi.js";
import { logger } from "../utils/logger.js";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Only active subscribers can enter the course. */
export function hasCourseAccess(member: Pick<Member, "subscriptionStatus">): boolean {
  return member.subscriptionStatus === "ACTIVE";
}

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

/** Members are stored as digits in either local (05x) or international (9725x) form. */
function phoneCandidates(input: string): string[] {
  const d = input.replace(/\D/g, "");
  if (!d) return [];
  const set = new Set([d]);
  if (d.startsWith("0")) set.add(`972${d.slice(1)}`);
  if (d.startsWith("972")) set.add(`0${d.slice(3)}`);
  return [...set];
}

function toInternational(phone: string): string {
  return phone.startsWith("0") ? `972${phone.slice(1)}` : phone;
}

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Sends a 6-digit code over WhatsApp. Silently does nothing for unknown/inactive numbers. */
export async function requestLoginCode(phoneInput: string): Promise<void> {
  const candidates = phoneCandidates(phoneInput);
  if (candidates.length === 0) throw new AuthError(400, "מספר טלפון לא תקין");

  const member = await prisma.member.findFirst({ where: { phone: { in: candidates } } });
  if (!member || !hasCourseAccess(member)) return;

  const recent = await prisma.loginCode.findFirst({
    where: { memberId: member.id, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
  });
  if (recent) throw new AuthError(429, "קוד נשלח לפני רגע, אפשר לבקש חדש בעוד דקה");

  const code = crypto.randomInt(100000, 1000000).toString();
  await prisma.loginCode.deleteMany({ where: { memberId: member.id } });
  await prisma.loginCode.create({
    data: { memberId: member.id, codeHash: sha256(code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });

  try {
    await sendMessage(
      phoneToChatId(toInternational(member.phone)),
      `קוד הכניסה שלך לקורס יוגה פנים: ${code}\nהקוד בתוקף ל-10 דקות.`,
    );
  } catch (err) {
    logger.error({ err, memberId: member.id }, "Failed to send WhatsApp login code");
    throw new AuthError(503, "לא הצלחנו לשלוח קוד בוואטסאפ כרגע, נסי שוב מאוחר יותר");
  }
}

/** Checks the code and returns a new session token. */
export async function verifyLoginCode(phoneInput: string, code: string): Promise<string> {
  const invalid = new AuthError(401, "הקוד שגוי או שפג תוקפו");
  const member = await prisma.member.findFirst({ where: { phone: { in: phoneCandidates(phoneInput) } } });
  if (!member || !hasCourseAccess(member)) throw invalid;

  const record = await prisma.loginCode.findFirst({ where: { memberId: member.id }, orderBy: { createdAt: "desc" } });
  if (!record || record.expiresAt < new Date() || record.attempts >= MAX_ATTEMPTS) throw invalid;

  const expected = Buffer.from(record.codeHash);
  const given = Buffer.from(sha256(code.trim()));
  if (!crypto.timingSafeEqual(expected, given)) {
    await prisma.loginCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    throw invalid;
  }

  await prisma.loginCode.deleteMany({ where: { memberId: member.id } });
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.studentSession.create({
    data: { tokenHash: sha256(token), memberId: member.id, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });
  return token;
}

export async function revokeSession(token: string): Promise<void> {
  await prisma.studentSession.deleteMany({ where: { tokenHash: sha256(token) } });
}

function bearer(req: Request): string | null {
  const header = req.header("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

export interface StudentRequest extends Request {
  member?: Member;
  sessionToken?: string;
}

/** Valid session AND a still-active subscription - a cancelled member loses access immediately. */
export async function requireStudent(req: StudentRequest, res: Response, next: NextFunction) {
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const session = await prisma.studentSession.findUnique({
    where: { tokenHash: sha256(token) },
    include: { member: true },
  });
  if (!session || session.expiresAt < new Date()) return res.status(401).json({ error: "Unauthorized" });
  if (!hasCourseAccess(session.member)) {
    return res.status(403).json({ error: "המנוי שלך אינו פעיל כרגע, ולכן אין גישה לקורס" });
  }
  req.member = session.member;
  req.sessionToken = token;
  next();
}
