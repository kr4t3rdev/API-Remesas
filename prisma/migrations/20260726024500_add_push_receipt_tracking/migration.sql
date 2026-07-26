CREATE TABLE "push_receipts" (
    "receiptId" TEXT NOT NULL,
    "pushToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_receipts_pkey" PRIMARY KEY ("receiptId")
);

CREATE INDEX "push_receipts_createdAt_idx" ON "push_receipts"("createdAt");
