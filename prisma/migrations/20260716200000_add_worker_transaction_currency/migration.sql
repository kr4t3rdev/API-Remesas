-- Worker transaction history is explicitly scoped to a currency.
-- Existing history is assigned to each worker owner's primary currency.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "worker_transactions" wt
    INNER JOIN "workers" w ON w."id" = wt."workerId"
    INNER JOIN "users" u ON u."id" = w."userId"
    WHERE u."primaryCurrencyId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot migrate worker transactions: one or more workers belong to users without a primary currency';
  END IF;
END
$$;

ALTER TABLE "worker_transactions" ADD COLUMN "currencyId" INTEGER;

UPDATE "worker_transactions" wt
SET "currencyId" = u."primaryCurrencyId"
FROM "workers" w
INNER JOIN "users" u ON u."id" = w."userId"
WHERE wt."workerId" = w."id";

ALTER TABLE "worker_transactions" ALTER COLUMN "currencyId" SET NOT NULL;

CREATE INDEX "worker_transactions_currencyId_createdAt_idx"
  ON "worker_transactions"("currencyId", "createdAt");

ALTER TABLE "worker_transactions"
  ADD CONSTRAINT "worker_transactions_currencyId_fkey"
  FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
