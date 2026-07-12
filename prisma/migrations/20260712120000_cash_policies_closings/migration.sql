CREATE TYPE "CashClosingStatus" AS ENUM ('CLOSED');

CREATE TABLE "cash_policies" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "currencyId" INTEGER NOT NULL,
  "safetyBuffer" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "insuranceLimit" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cash_policies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cash_closings" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "currencyId" INTEGER NOT NULL,
  "businessDate" DATE NOT NULL,
  "expectedBalance" DECIMAL(15,2) NOT NULL,
  "actualBalance" DECIMAL(15,2) NOT NULL,
  "difference" DECIMAL(15,2) NOT NULL,
  "status" "CashClosingStatus" NOT NULL DEFAULT 'CLOSED',
  "closedById" INTEGER NOT NULL,
  "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cash_closings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cash_policies_userId_currencyId_key" ON "cash_policies"("userId", "currencyId");
CREATE INDEX "cash_policies_userId_currencyId_idx" ON "cash_policies"("userId", "currencyId");
CREATE UNIQUE INDEX "cash_closings_userId_currencyId_businessDate_key" ON "cash_closings"("userId", "currencyId", "businessDate");
CREATE INDEX "cash_closings_userId_businessDate_idx" ON "cash_closings"("userId", "businessDate");

ALTER TABLE "cash_policies" ADD CONSTRAINT "cash_policies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cash_policies" ADD CONSTRAINT "cash_policies_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cash_closings" ADD CONSTRAINT "cash_closings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cash_closings" ADD CONSTRAINT "cash_closings_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cash_closings" ADD CONSTRAINT "cash_closings_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
