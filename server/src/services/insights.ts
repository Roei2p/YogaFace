import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../db.js";
import { config } from "../config.js";

async function buildDataSnapshot() {
  const [byStatus, groupCounts, recentEvents, recentJoins, recentCancellations, revenueAgg, totalMembers] =
    await Promise.all([
      prisma.member.groupBy({ by: ["subscriptionStatus"], _count: true }),
      prisma.member.groupBy({ by: ["groupStatus"], _count: true }),
      prisma.auditEvent.findMany({
        where: { type: { not: "cardcom_raw" } },
        orderBy: { createdAt: "desc" },
        take: 40,
        include: { member: { select: { name: true, phone: true } } },
      }),
      prisma.member.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { name: true, phone: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.member.findMany({
        where: { subscriptionStatus: "CANCELLED", updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { name: true, phone: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 20,
      }),
      prisma.member.aggregate({ _sum: { lastPaymentAmount: true }, where: { subscriptionStatus: "ACTIVE" } }),
      prisma.member.count(),
    ]);

  return {
    generatedAt: new Date().toISOString(),
    totalMembers,
    membersBySubscriptionStatus: Object.fromEntries(byStatus.map((s) => [s.subscriptionStatus, s._count])),
    membersByGroupStatus: Object.fromEntries(groupCounts.map((s) => [s.groupStatus, s._count])),
    estimatedMonthlyRevenueFromActiveMembers: revenueAgg._sum.lastPaymentAmount ?? 0,
    newMembersLast30Days: recentJoins,
    cancellationsLast30Days: recentCancellations,
    recentActivityLog: recentEvents.map((e) => ({
      type: e.type,
      message: e.message,
      member: e.member ? { name: e.member.name, phone: e.member.phone } : null,
      at: e.createdAt.toISOString(),
    })),
  };
}

export async function answerInsightsQuestion(question: string): Promise<string> {
  if (!config.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured on the server");
  }

  const snapshot = await buildDataSnapshot();
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system:
      "את/ה עוזר/ת נתונים לבעלת סטודיו ליוגה פנים שמנהלת קבוצת וואטסאפ בתשלום. " +
      "ענה/י בעברית, בקצרה ולעניין, אך ורק על סמך נתוני ה-JSON המצורפים. " +
      "אם המידע לא מספיק כדי לענות בביטחון, אמר/י זאת במפורש במקום לנחש. " +
      "כשמתאים, הצע/י תובנה או פעולה מעשית (למשל לפנות למישהי שביטלה).",
    messages: [
      {
        role: "user",
        content: `נתוני העסק (JSON):\n${JSON.stringify(snapshot, null, 2)}\n\nשאלה: ${question}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "לא התקבלה תשובה.";
}
