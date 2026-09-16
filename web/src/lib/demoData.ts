// Fixture data for the GitHub Pages demo build (VITE_DEMO_MODE=true), which
// has no real backend behind it - see api.ts. Not used in a real deploy.
import type { AuditEvent, Member, Stats, TimeseriesPoint } from "./api";

export const DEMO_STATS: Stats = {
  totalMembers: 42,
  active: 34,
  trial: 2,
  cancelled: 5,
  expired: 1,
  inGroup: 36,
  newLast30d: 6,
  cancelledLast30d: 2,
  estimatedMrr: 3366,
  syncErrors: 1,
};

export const DEMO_TIMESERIES: TimeseriesPoint[] = [
  { day: "2026-08-18", added: 3, removed: 0, groupSize: 28 },
  { day: "2026-08-25", added: 4, removed: 1, groupSize: 31 },
  { day: "2026-09-01", added: 2, removed: 1, groupSize: 32 },
  { day: "2026-09-08", added: 5, removed: 0, groupSize: 37 },
  { day: "2026-09-15", added: 1, removed: 2, groupSize: 36 },
];

export const DEMO_MEMBERS: Member[] = [
  {
    id: "demo-1",
    name: "דנה כהן",
    phone: "972501112222",
    subscriptionStatus: "ACTIVE",
    groupStatus: "IN_GROUP",
    groupStatusError: null,
    lastPaymentAmount: 99,
    lastPaymentAt: "2026-09-10T08:00:00.000Z",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-09-10T08:00:00.000Z",
  },
  {
    id: "demo-2",
    name: "מיכל לוי",
    phone: "972503334444",
    subscriptionStatus: "CANCELLED",
    groupStatus: "NOT_IN_GROUP",
    groupStatusError: null,
    lastPaymentAmount: 99,
    lastPaymentAt: "2026-08-12T08:00:00.000Z",
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "demo-3",
    name: "יעל ישראלי",
    phone: "972505556666",
    subscriptionStatus: "ACTIVE",
    groupStatus: "ERROR",
    groupStatusError: "Green API: participant not found (ייתכן שהוסרה ידנית מהקבוצה)",
    lastPaymentAmount: 99,
    lastPaymentAt: "2026-09-14T08:00:00.000Z",
    createdAt: "2026-09-14T08:00:00.000Z",
    updatedAt: "2026-09-14T08:00:00.000Z",
  },
];

export const DEMO_AUDIT_LOG: AuditEvent[] = [
  {
    id: "demo-e1",
    type: "added_to_group",
    message: "דנה כהן נוספה לקבוצת הוואטסאפ",
    createdAt: "2026-09-14T09:00:00.000Z",
    member: { name: "דנה כהן", phone: "972501112222" },
  },
  {
    id: "demo-e2",
    type: "subscription_cancelled",
    message: 'אירוע Cardcom "subscription_cancelled" עבור מיכל לוי',
    createdAt: "2026-09-13T14:20:00.000Z",
    member: { name: "מיכל לוי", phone: "972503334444" },
  },
  {
    id: "demo-e3",
    type: "removed_from_group",
    message: "מיכל לוי הוסרה מקבוצת הוואטסאפ (מנוי בוטל)",
    createdAt: "2026-09-13T14:21:00.000Z",
    member: { name: "מיכל לוי", phone: "972503334444" },
  },
  {
    id: "demo-e4",
    type: "sync_error",
    message: "נכשלה הוספת יעל ישראלי לקבוצה: participant not found",
    createdAt: "2026-09-14T09:05:00.000Z",
    member: { name: "יעל ישראלי", phone: "972505556666" },
  },
];

export const DEMO_INSIGHTS_ANSWER =
  "זו תשובת הדגמה - בגרסה החיה אני עונה על סמך הנתונים האמיתיים של הקבוצה שלך (חברות פעילות, ביטולים, הכנסה) דרך מודל שפה של NVIDIA.";
