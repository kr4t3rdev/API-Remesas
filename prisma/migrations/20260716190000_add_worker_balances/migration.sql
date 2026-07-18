-- DEPLOYMENT PREFLIGHT: every user that owns a worker MUST have primaryCurrencyId
-- backfilled before this migration runs. This migration intentionally fails instead
-- of guessing a currency, because assigning an aggregate balance to the wrong
-- currency would create an accounting discrepancy that cannot be repaired safely.
-- Worker balances are now tracked independently for each currency; existing
-- aggregate worker values are migrated to the owning user's primary currency.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "workers" w
    INNER JOIN "users" u ON u."id" = w."userId"
    WHERE u."primaryCurrencyId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot migrate worker balances: one or more workers belong to users without a primary currency';
  END IF;
END
$$;

CREATE TABLE "worker_balances" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "accumulatedProfit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalDelivered" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_balances_pkey" PRIMARY KEY ("id")
);

INSERT INTO "worker_balances" (
    "workerId", "currencyId", "balance", "accumulatedProfit", "totalDelivered", "updatedAt"
)
SELECT
    w."id", u."primaryCurrencyId", w."balance", w."accumulatedProfit", w."totalDelivered", CURRENT_TIMESTAMP
FROM "workers" w
INNER JOIN "users" u ON u."id" = w."userId";

CREATE UNIQUE INDEX "worker_balances_workerId_currencyId_key"
  ON "worker_balances"("workerId", "currencyId");
CREATE INDEX "worker_balances_workerId_idx" ON "worker_balances"("workerId");
CREATE INDEX "worker_balances_currencyId_idx" ON "worker_balances"("currencyId");

ALTER TABLE "worker_balances"
  ADD CONSTRAINT "worker_balances_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "worker_balances"
  ADD CONSTRAINT "worker_balances_currencyId_fkey"
  FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
