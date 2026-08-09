-- Worker foreign-currency custody needs a cost basis in the user's primary currency
-- so performance can be realized automatically when funds are deposited.
ALTER TYPE "WorkerTransactionType" ADD VALUE IF NOT EXISTS 'FX_CONVERSION';
ALTER TYPE "WorkerTransactionType" ADD VALUE IF NOT EXISTS 'DEPOSIT';

ALTER TABLE "worker_balances"
  ADD COLUMN "costBasisPrimary" DECIMAL(15, 2) NOT NULL DEFAULT 0;
