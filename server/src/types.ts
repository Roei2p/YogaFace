export const SUBSCRIPTION_STATUSES = ["ACTIVE", "CANCELLED", "EXPIRED", "TRIAL", "UNKNOWN"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const GROUP_STATUSES = ["IN_GROUP", "NOT_IN_GROUP", "ERROR"] as const;
export type GroupStatus = (typeof GROUP_STATUSES)[number];
