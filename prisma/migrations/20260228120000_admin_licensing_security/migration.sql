-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'SEMIANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "LicenseState" AS ENUM ('TRIAL', 'ACTIVE', 'GRACE', 'EXPIRED', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_USER_REGISTERED', 'USER_TEMP_BLOCKED', 'USER_BANNED', 'LICENSE_EXPIRING');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'WEBHOOK', 'EMAIL');

-- AlterTable
ALTER TABLE "users"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "blockedUntil" TIMESTAMP(3),
  ADD COLUMN "isBanned" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "bannedUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "plans" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "monthlyUsd" DECIMAL(10,2) NOT NULL DEFAULT 15.00,
  "semiannualUsd" DECIMAL(10,2) NOT NULL DEFAULT 85.50,
  "annualUsd" DECIMAL(10,2) NOT NULL DEFAULT 162.00,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_licenses" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "planId" INTEGER NOT NULL,
  "state" "LicenseState" NOT NULL DEFAULT 'TRIAL',
  "cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "graceUntil" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "lastPaymentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_events" (
  "id" SERIAL NOT NULL,
  "userLicenseId" INTEGER NOT NULL,
  "fromState" "LicenseState",
  "toState" "LicenseState" NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "license_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_payments" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "userLicenseId" INTEGER,
  "planId" INTEGER NOT NULL,
  "cycle" "BillingCycle" NOT NULL,
  "amountUsd" DECIMAL(12,2) NOT NULL,
  "exchangeRateUsed" DECIMAL(10,4) NOT NULL,
  "amountCup" DECIMAL(15,2) NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER,
  "type" "NotificationType" NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "payload" JSONB,
  "readAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
  "id" SERIAL NOT NULL,
  "actorUserId" INTEGER NOT NULL,
  "targetUserId" INTEGER,
  "action" TEXT NOT NULL,
  "previousValue" JSONB,
  "newValue" JSONB,
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");
CREATE INDEX "users_blockedUntil_idx" ON "users"("blockedUntil");
CREATE INDEX "users_isBanned_bannedUntil_idx" ON "users"("isBanned", "bannedUntil");
CREATE INDEX "plans_isActive_idx" ON "plans"("isActive");
CREATE INDEX "user_licenses_userId_state_idx" ON "user_licenses"("userId", "state");
CREATE INDEX "user_licenses_expiresAt_state_idx" ON "user_licenses"("expiresAt", "state");
CREATE INDEX "license_events_userLicenseId_createdAt_idx" ON "license_events"("userLicenseId", "createdAt");
CREATE INDEX "subscription_payments_userId_paidAt_idx" ON "subscription_payments"("userId", "paidAt");
CREATE INDEX "subscription_payments_planId_cycle_idx" ON "subscription_payments"("planId", "cycle");
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");
CREATE INDEX "notifications_type_createdAt_idx" ON "notifications"("type", "createdAt");
CREATE INDEX "admin_audit_logs_actorUserId_createdAt_idx" ON "admin_audit_logs"("actorUserId", "createdAt");
CREATE INDEX "admin_audit_logs_targetUserId_createdAt_idx" ON "admin_audit_logs"("targetUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "user_licenses" ADD CONSTRAINT "user_licenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_licenses" ADD CONSTRAINT "user_licenses_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "license_events" ADD CONSTRAINT "license_events_userLicenseId_fkey" FOREIGN KEY ("userLicenseId") REFERENCES "user_licenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_userLicenseId_fkey" FOREIGN KEY ("userLicenseId") REFERENCES "user_licenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
