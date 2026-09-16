-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "cardcomCustomerId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "subscriptionStart" DATETIME,
    "subscriptionEnd" DATETIME,
    "lastPaymentAt" DATETIME,
    "lastPaymentAmount" REAL,
    "groupStatus" TEXT NOT NULL DEFAULT 'NOT_IN_GROUP',
    "groupStatusError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEvent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "whatsappGroupId" TEXT,
    "notifyEmail" TEXT,
    "notifyWhatsappPhone" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_phone_key" ON "Member"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Member_cardcomCustomerId_key" ON "Member"("cardcomCustomerId");

-- CreateIndex
CREATE INDEX "Member_subscriptionStatus_idx" ON "Member"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "Member_groupStatus_idx" ON "Member"("groupStatus");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_type_idx" ON "AuditEvent"("type");
