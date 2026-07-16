CREATE TYPE "FxOperationKind" AS ENUM ('TRANSFER', 'REMITTANCE');

ALTER TABLE "transactions"
  ADD COLUMN "operationKind" "FxOperationKind" NOT NULL DEFAULT 'TRANSFER',
  ADD COLUMN "persistRate" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "transactions_userId_operationKind_createdAt_idx"
  ON "transactions"("userId", "operationKind", "createdAt");
