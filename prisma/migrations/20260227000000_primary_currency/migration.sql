-- CreateTable
CREATE TABLE "primary_currency" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "users" ADD COLUMN "primaryCurrencyId" INTEGER;

-- CreateForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_primaryCurrencyId_fkey" FOREIGN KEY ("primaryCurrencyId") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "users_primaryCurrencyId_idx" ON "users"("primaryCurrencyId");
