-- CreateEnum
CREATE TYPE "WorkerTransactionType" AS ENUM ('TRANSACTION', 'BALANCE_ADD');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "nickname" TEXT;

-- CreateTable
CREATE TABLE "workers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "photoUrl" TEXT,
    "initials" TEXT NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "accumulatedProfit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalDelivered" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_transactions" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "type" "WorkerTransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "profit" DECIMAL(15,2),
    "balanceBefore" DECIMAL(15,2) NOT NULL,
    "balanceAfter" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workers_userId_idx" ON "workers"("userId");

-- CreateIndex
CREATE INDEX "worker_transactions_workerId_createdAt_idx" ON "worker_transactions"("workerId", "createdAt");

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_transactions" ADD CONSTRAINT "worker_transactions_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
