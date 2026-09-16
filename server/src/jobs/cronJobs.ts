import cron from "node-cron";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import { reconcileWithLiveGroup } from "../services/memberSync.js";
import { sendDailyDigest } from "../services/digest.js";

export function startCronJobs(): void {
  if (config.whatsappGroupId) {
    cron.schedule(config.reconcileCron, async () => {
      try {
        const { corrected } = await reconcileWithLiveGroup();
        if (corrected > 0) logger.info({ corrected }, "Reconciliation corrected member/group drift");
      } catch (err) {
        logger.error({ err }, "Reconciliation job failed");
      }
    });
    logger.info({ schedule: config.reconcileCron }, "Reconciliation cron scheduled");
  } else {
    logger.warn("WHATSAPP_GROUP_ID not set - reconciliation cron disabled");
  }

  if (config.notify.emailTo || config.notify.whatsappPhone) {
    cron.schedule(config.digestCron, async () => {
      try {
        await sendDailyDigest();
      } catch (err) {
        logger.error({ err }, "Digest job failed");
      }
    });
    logger.info({ schedule: config.digestCron }, "Digest cron scheduled");
  } else {
    logger.warn("No NOTIFY_EMAIL_TO / NOTIFY_WHATSAPP_PHONE set - digest cron disabled");
  }
}
