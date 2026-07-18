-- Persist optional worker context on FX transactions so idempotency can replay safely.
ALTER TABLE "transactions" ADD COLUMN "workerId" INTEGER;
ALTER TABLE "transactions" ADD COLUMN "workerProfit" DECIMAL(15,2);
ALTER TABLE "transactions" ADD COLUMN "workerCurrencyId" INTEGER;

CREATE INDEX "transactions_workerId_idx" ON "transactions"("workerId");
CREATE INDEX "transactions_workerCurrencyId_idx" ON "transactions"("workerCurrencyId");

ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_workerCurrencyId_fkey"
  FOREIGN KEY ("workerCurrencyId") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
