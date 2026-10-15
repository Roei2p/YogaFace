import { config } from "../config.js";
import { logger } from "../utils/logger.js";

/**
 * Thin client for Green API (green-api.com), an unofficial WhatsApp
 * gateway that authenticates by scanning a QR code with a real WhatsApp
 * number - no Meta Business verification needed. Docs: green-api.com/en/docs
 */

const BASE_URL = "https://api.green-api.com";

function endpoint(method: string): string {
  const { idInstance, apiToken } = config.greenApi;
  if (!idInstance || !apiToken) {
    throw new Error(
      "GREEN_API_ID_INSTANCE / GREEN_API_TOKEN are not configured",
    );
  }
  return `${BASE_URL}/waInstance${idInstance}/${method}/${apiToken}`;
}

async function call<T>(method: string, body?: unknown, httpMethod: "POST" | "GET" = "POST"): Promise<T> {
  const res = await fetch(endpoint(method), {
    method: httpMethod,
    headers: { "Content-Type": "application/json" },
    body: httpMethod === "POST" && body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    logger.error({ method, status: res.status, body: json }, "Green API call failed");
    throw new Error(`Green API ${method} failed: ${res.status} ${text}`);
  }
  return json as T;
}

/** Converts a phone number (any format, digits only kept) to a WhatsApp chat id. */
export function phoneToChatId(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@c.us`;
}

export async function sendMessage(chatId: string, message: string): Promise<void> {
  await call("sendMessage", { chatId, message });
}

export async function addGroupParticipant(
  groupId: string,
  participantChatId: string,
): Promise<void> {
  await call("addGroupParticipant", { groupId, participantChatId });
}

export async function removeGroupParticipant(
  groupId: string,
  participantChatId: string,
): Promise<void> {
  await call("removeGroupParticipant", { groupId, participantChatId });
}

export interface GroupParticipant {
  id: string;
  isAdmin?: boolean;
}

export interface GroupData {
  groupId: string;
  groupName?: string;
  participants: GroupParticipant[];
}

export async function getGroupData(groupId: string): Promise<GroupData> {
  return call<GroupData>("getGroupData", { groupId });
}

export interface ChatSummary {
  id: string;
  name?: string;
}

/**
 * Lists every chat (DM and group) the linked WhatsApp number can see.
 * Used to let the owner pick their group by name instead of having to
 * already know its id - see /api/settings/whatsapp-groups.
 *
 * Like the Cardcom field mapping, this method/shape is based on commonly
 * documented Green API conventions rather than a live-verified call (no
 * network access to green-api.com while this was written). If
 * GET /api/settings/whatsapp-groups errors or returns something odd, check
 * the real response shape in Green API's console and adjust this function.
 */
export async function getChats(): Promise<ChatSummary[]> {
  return call<ChatSummary[]>("getChats", undefined, "GET");
}

/** Just the groups (ids ending in @g.us) from getChats(). */
export async function listGroups(): Promise<ChatSummary[]> {
  const chats = await getChats();
  return chats.filter((c) => c.id.endsWith("@g.us"));
}
