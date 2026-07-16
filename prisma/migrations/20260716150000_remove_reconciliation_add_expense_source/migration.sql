-- Add the new source ledger columns while reconciliation data is still available.
ALTER TABLE "expenses"
  ADD COLUMN "sourceType" "TransferAccountType",
  ADD COLUMN "sourceBankAccountId" INTEGER;

-- Preserve historical payment origin in environments that contain reconciliations.
UPDATE "expenses" AS expense
SET "sourceType" = 'BANK_ACCOUNT',
    "sourceBankAccountId" = reconciliation."bankAccountId"
FROM "expense_reconciliations" AS reconciliation
WHERE reconciliation."expenseId" = expense."id";

-- Expenses without a bank reconciliation were cash-sourced under the old model.
UPDATE "expenses"
SET "sourceType" = 'CASH', "sourceBankAccountId" = NULL
WHERE "sourceType" IS NULL;

ALTER TABLE "expenses" ALTER COLUMN "sourceType" SET NOT NULL;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_sourceBankAccountId_fkey"
  FOREIGN KEY ("sourceBankAccountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_source_account_check" CHECK (
  ("sourceType" = 'CASH' AND "sourceBankAccountId" IS NULL) OR
  ("sourceType" = 'BANK_ACCOUNT' AND "sourceBankAccountId" IS NOT NULL)
);
CREATE INDEX "expenses_userId_sourceType_date_idx" ON "expenses"("userId", "sourceType", "date");
CREATE INDEX "expenses_sourceBankAccountId_date_idx" ON "expenses"("sourceBankAccountId", "date");

-- Reconciliation artifacts can be removed only after their source data is copied.
DROP TABLE "expense_reconciliations";
DROP TABLE "income_reconciliations";

DROP INDEX IF EXISTS "transactions_userId_status_idx";
ALTER TABLE "transactions" DROP COLUMN "status";
DROP INDEX IF EXISTS "expenses_userId_status_idx";
ALTER TABLE "expenses" DROP COLUMN "status";

DROP TYPE "ReconciliationStatus";
DROP TYPE "RateType";
