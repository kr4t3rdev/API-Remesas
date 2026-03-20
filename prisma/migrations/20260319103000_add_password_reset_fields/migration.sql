ALTER TABLE "users"
ADD COLUMN "passwordResetToken" TEXT,
ADD COLUMN "passwordResetExpires" TIMESTAMP(3);

CREATE INDEX "users_passwordResetToken_idx" ON "users"("passwordResetToken");
CREATE INDEX "users_passwordResetExpires_idx" ON "users"("passwordResetExpires");
