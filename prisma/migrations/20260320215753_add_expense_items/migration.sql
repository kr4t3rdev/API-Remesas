-- CreateTable
CREATE TABLE "expense_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_items_userId_createdAt_idx" ON "expense_items"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "expense_items_userId_category_idx" ON "expense_items"("userId", "category");

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
