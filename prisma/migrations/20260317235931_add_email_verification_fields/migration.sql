-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'EMAIL_VERIFICATION';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationExpires" TIMESTAMP(3),
ADD COLUMN     "verificationSentAt" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT;

-- CreateIndex
CREATE INDEX "users_verificationToken_idx" ON "users"("verificationToken");

-- CreateIndex
CREATE INDEX "users_verificationExpires_idx" ON "users"("verificationExpires");
