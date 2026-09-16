/**
 * Cardcom billing adapter.
 *
 * IMPORTANT: this environment had no outbound access to Cardcom's docs
 * while this file was written, so the exact webhook field names below are
 * a best-effort mapping based on Cardcom's commonly documented
 * "Recurring Payments" / Low-Profile notification fields. Before going
 * live:
 *   1. In the Cardcom back-office, point the recurring-billing webhook to
 *      POST https://<your-domain>/webhooks/cardcom/<CARDCOM_WEBHOOK_SECRET>
 *   2. Trigger one real (or sandbox) event of each kind you care about
 *      (successful charge, failed charge, subscription cancelled) and
 *      inspect the raw payload logged as an AuditEvent (type "cardcom_raw")
 *      in the database / dashboard.
 *   3. Adjust `fieldMap` below to match what Cardcom actually sends - no
 *      other code needs to change.
 */

export type CardcomEventType =
  | "payment_success"
  | "payment_failed"
  | "subscription_cancelled"
  | "unknown";

export interface NormalizedCardcomEvent {
  type: CardcomEventType;
  phone: string | null;
  name: string | null;
  cardcomCustomerId: string | null;
  amount: number | null;
  raw: Record<string, unknown>;
}

// Adjust these keys to match the real Cardcom payload field names once verified.
const fieldMap = {
  phone: ["CardOwnerPhone", "Phone", "phone"],
  name: ["CardOwnerName", "Name", "name"],
  customerId: ["ReturnValue", "CustomerId", "TokenId", "customerId"],
  amount: ["SumToBill", "Sum", "amount"],
  approved: ["Approved", "ResponseCode", "approved"],
  operation: ["Operation", "TransactionType", "operation"],
};

function pick(payload: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") {
      return payload[key];
    }
  }
  return null;
}

function toStringOrNull(v: unknown): string | null {
  return v === null || v === undefined ? null : String(v);
}

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function classify(payload: Record<string, unknown>): CardcomEventType {
  const operation = String(pick(payload, fieldMap.operation) ?? "").toLowerCase();
  const approvedRaw = pick(payload, fieldMap.approved);
  const approved =
    approvedRaw === "1" ||
    approvedRaw === 1 ||
    approvedRaw === true ||
    approvedRaw === "true" ||
    approvedRaw === "0"; // Cardcom's ResponseCode uses "0" for success on some endpoints

  if (operation.includes("cancel")) return "subscription_cancelled";
  if (operation.includes("charge") || operation.includes("payment") || operation === "") {
    return approved ? "payment_success" : "payment_failed";
  }
  return "unknown";
}

export function parseCardcomWebhook(payload: Record<string, unknown>): NormalizedCardcomEvent {
  return {
    type: classify(payload),
    phone: toStringOrNull(pick(payload, fieldMap.phone)),
    name: toStringOrNull(pick(payload, fieldMap.name)),
    cardcomCustomerId: toStringOrNull(pick(payload, fieldMap.customerId)),
    amount: toNumberOrNull(pick(payload, fieldMap.amount)),
    raw: payload,
  };
}
