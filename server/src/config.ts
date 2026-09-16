import "dotenv/config";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  dashboardApiToken: process.env.DASHBOARD_API_TOKEN ?? "",

  greenApi: {
    idInstance: process.env.GREEN_API_ID_INSTANCE ?? "",
    apiToken: process.env.GREEN_API_TOKEN ?? "",
  },
  whatsappGroupId: process.env.WHATSAPP_GROUP_ID ?? "",

  cardcom: {
    webhookSecret: process.env.CARDCOM_WEBHOOK_SECRET ?? "",
    terminalNumber: process.env.CARDCOM_TERMINAL_NUMBER ?? "",
    apiName: process.env.CARDCOM_API_NAME ?? "",
    apiPassword: process.env.CARDCOM_API_PASSWORD ?? "",
  },

  nvidia: {
    apiKey: process.env.NVIDIA_API_KEY ?? "",
    baseUrl: process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1",
    model: process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct",
  },

  notify: {
    emailTo: process.env.NOTIFY_EMAIL_TO ?? "",
    smtpHost: process.env.SMTP_HOST ?? "",
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    smtpUser: process.env.SMTP_USER ?? "",
    smtpPass: process.env.SMTP_PASS ?? "",
    whatsappPhone: process.env.NOTIFY_WHATSAPP_PHONE ?? "",
  },

  digestCron: process.env.DIGEST_CRON ?? "0 8 * * *",
  reconcileCron: process.env.RECONCILE_CRON ?? "*/30 * * * *",
};

export { required };
