import { prisma } from "../db.js";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import {
  addGroupParticipant,
  removeGroupParticipant,
  getGroupData,
  phoneToChatId,
} from "../integrations/greenApi.js";
import type { Member } from "@prisma/client";

async function getGroupId(): Promise<string | null> {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  return settings?.whatsappGroupId || config.whatsappGroupId || null;
}

async function logEvent(memberId: string | null, type: string, message: string, payload?: unknown) {
  await prisma.auditEvent.create({
    data: {
      memberId,
      type,
      message,
      payload: payload ? JSON.stringify(payload) : null,
    },
  });
}

/** Should this member currently be a participant in the WhatsApp group? */
export function shouldBeInGroup(member: Pick<Member, "subscriptionStatus">): boolean {
  return member.subscriptionStatus === "ACTIVE" || member.subscriptionStatus === "TRIAL";
}

/**
 * Reconciles a single member's WhatsApp group membership with their
 * subscription status: adds paying members, removes cancelled/expired ones.
 * No-op if the member is already in the correct state.
 */
export async function syncMember(member: Member): Promise<void> {
  const groupId = await getGroupId();
  if (!groupId) {
    logger.warn("WHATSAPP_GROUP_ID not configured - skipping sync");
    return;
  }

  const wantsIn = shouldBeInGroup(member);
  const chatId = phoneToChatId(member.phone);

  if (wantsIn && member.groupStatus !== "IN_GROUP") {
    try {
      await addGroupParticipant(groupId, chatId);
      await prisma.member.update({
        where: { id: member.id },
        data: { groupStatus: "IN_GROUP", groupStatusError: null },
      });
      await logEvent(member.id, "added_to_group", `${member.name ?? member.phone} added to WhatsApp group`);
      logger.info({ memberId: member.id }, "Added member to group");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.member.update({
        where: { id: member.id },
        data: { groupStatus: "ERROR", groupStatusError: message },
      });
      await logEvent(member.id, "sync_error", `Failed to add ${member.name ?? member.phone} to group: ${message}`);
      logger.error({ memberId: member.id, err: message }, "Failed to add member to group");
    }
    return;
  }

  if (!wantsIn && member.groupStatus === "IN_GROUP") {
    try {
      await removeGroupParticipant(groupId, chatId);
      await prisma.member.update({
        where: { id: member.id },
        data: { groupStatus: "NOT_IN_GROUP", groupStatusError: null },
      });
      await logEvent(
        member.id,
        "removed_from_group",
        `${member.name ?? member.phone} removed from WhatsApp group (subscription ${member.subscriptionStatus.toLowerCase()})`,
      );
      logger.info({ memberId: member.id }, "Removed member from group");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.member.update({
        where: { id: member.id },
        data: { groupStatus: "ERROR", groupStatusError: message },
      });
      await logEvent(member.id, "sync_error", `Failed to remove ${member.name ?? member.phone} from group: ${message}`);
      logger.error({ memberId: member.id, err: message }, "Failed to remove member from group");
    }
  }
}

/** Runs syncMember for every member whose local state doesn't match their target state. */
export async function syncAllPendingMembers(): Promise<{ synced: number }> {
  const members = await prisma.member.findMany();
  let synced = 0;
  for (const member of members) {
    const wantsIn = shouldBeInGroup(member);
    const mismatched =
      (wantsIn && member.groupStatus !== "IN_GROUP") || (!wantsIn && member.groupStatus === "IN_GROUP");
    if (mismatched) {
      await syncMember(member);
      synced++;
    }
  }
  return { synced };
}

/**
 * Compares the live WhatsApp group participant list against our DB and
 * corrects drift (e.g. someone was removed manually, or a webhook was
 * missed and a cancelled member is still sitting in the group).
 */
export async function reconcileWithLiveGroup(): Promise<{ corrected: number }> {
  const groupId = await getGroupId();
  if (!groupId) return { corrected: 0 };

  const [groupData, members] = await Promise.all([getGroupData(groupId), prisma.member.findMany()]);
  const liveParticipantIds = new Set(groupData.participants.map((p) => p.id));
  let corrected = 0;

  for (const member of members) {
    const chatId = phoneToChatId(member.phone);
    const actuallyInGroup = liveParticipantIds.has(chatId);
    const dbSaysInGroup = member.groupStatus === "IN_GROUP";

    if (actuallyInGroup !== dbSaysInGroup) {
      await prisma.member.update({
        where: { id: member.id },
        data: { groupStatus: actuallyInGroup ? "IN_GROUP" : "NOT_IN_GROUP" },
      });
      await logEvent(
        member.id,
        "drift_corrected",
        `Group membership drift corrected for ${member.name ?? member.phone}: DB said ${
          dbSaysInGroup ? "in group" : "not in group"
        }, WhatsApp said ${actuallyInGroup ? "in group" : "not in group"}`,
      );
      corrected++;
    }
  }

  // After correcting drift, re-run the normal sync so anyone who should be
  // added/removed based on subscription status gets handled.
  const { synced } = await syncAllPendingMembers();
  return { corrected: corrected + synced };
}
