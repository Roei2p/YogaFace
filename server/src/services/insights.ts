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

const SYSTEM_PROMPT =
  "את/ה עוזר/ת נתונים לבעלת סטודיו ליוגה פנים שמנהלת קבוצת וואטסאפ בתשלום. " +
  "ענה/י בעברית, בקצרה ולעניין, אך ורק על סמך נתוני ה-JSON המצורפים. " +
  "אם המידע לא מספיק כדי לענות בביטחון, אמר/י זאת במפורש במקום לנחש. " +
  "כשמתאים, הצע/י תובנה או פעולה מעשית (למשל לפנות למישהי שביטלה).";

interface OpenAiCompatibleChatResponse {
  choices?: { message?: { content?: string } }[];
}

/**
 * Calls an NVIDIA NIM-hosted model (or any other OpenAI-compatible
 * chat-completions endpoint) - see NVIDIA_BASE_URL / NVIDIA_MODEL in
 * .env.example. Default points at NVIDIA's hosted API (build.nvidia.com);
 * point it at a self-hosted NIM endpoint instead by changing NVIDIA_BASE_URL.
 */
export async function answerInsightsQuestion(question: string): Promise<string> {
  if (!config.nvidia.apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured on the server");
  }

  const snapshot = await buildDataSnapshot();

  const res = await fetch(`${config.nvidia.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.nvidia.apiKey}`,
    },
    body: JSON.stringify({
      model: config.nvidia.model,
      max_tokens: 1024,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `נתוני העסק (JSON):\n${JSON.stringify(snapshot, null, 2)}\n\nשאלה: ${question}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`NVIDIA API call failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as OpenAiCompatibleChatResponse;
  return data.choices?.[0]?.message?.content ?? "לא התקבלה תשובה.";
}
