CREATE TYPE "CurrencyPositionReviewStatus" AS ENUM ('UNREVIEWED', 'REVIEWED');
CREATE TYPE "CurrencyMovementType" AS ENUM ('OPENING', 'PURCHASE', 'SALE', 'ADJUSTMENT', 'REMITTANCE');
CREATE TYPE "RemittanceStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

CREATE TABLE "currency_positions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "saldo" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "costoPromedio" DECIMAL(15,6),
    "reviewStatus" "CurrencyPositionReviewStatus" NOT NULL DEFAULT 'UNREVIEWED',
    "openingSaldo" DECIMAL(15,6),
    "openingCost" DECIMAL(15,6),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "currency_positions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "remittances" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" "RemittanceStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "remittances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "currency_movements" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "positionId" INTEGER,
    "transactionId" INTEGER,
    "type" "CurrencyMovementType" NOT NULL,
    "amount" DECIMAL(15,6) NOT NULL,
    "rate" DECIMAL(15,6) NOT NULL,
    "costSnapshot" DECIMAL(15,6),
    "realizedProfit" DECIMAL(15,6),
    "remittanceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "currency_movements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "currency_positions_userId_currencyId_key" ON "currency_positions"("userId", "currencyId");
CREATE INDEX "currency_positions_userId_reviewStatus_idx" ON "currency_positions"("userId", "reviewStatus");
CREATE UNIQUE INDEX "remittances_provider_sourceId_key" ON "remittances"("provider", "sourceId");
CREATE INDEX "remittances_userId_status_createdAt_idx" ON "remittances"("userId", "status", "createdAt");
CREATE INDEX "remittances_idempotencyKey_idx" ON "remittances"("idempotencyKey");
CREATE INDEX "currency_movements_userId_currencyId_createdAt_idx" ON "currency_movements"("userId", "currencyId", "createdAt");
CREATE INDEX "currency_movements_userId_type_createdAt_idx" ON "currency_movements"("userId", "type", "createdAt");

ALTER TABLE "currency_positions" ADD CONSTRAINT "currency_positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "currency_positions" ADD CONSTRAINT "currency_positions_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "remittances" ADD CONSTRAINT "remittances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "currency_movements" ADD CONSTRAINT "currency_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "currency_movements" ADD CONSTRAINT "currency_movements_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "currency_movements" ADD CONSTRAINT "currency_movements_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "currency_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "currency_movements" ADD CONSTRAINT "currency_movements_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "currency_movements" ADD CONSTRAINT "currency_movements_remittanceId_fkey" FOREIGN KEY ("remittanceId") REFERENCES "remittances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
