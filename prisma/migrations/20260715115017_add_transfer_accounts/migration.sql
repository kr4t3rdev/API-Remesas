-- CreateEnum
CREATE TYPE "TransferAccountType" AS ENUM ('CASH', 'BANK_ACCOUNT');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "destinationBankAccountId" INTEGER,
ADD COLUMN     "destinationType" "TransferAccountType" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "sourceBankAccountId" INTEGER,
ADD COLUMN     "sourceType" "TransferAccountType" NOT NULL DEFAULT 'CASH';

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sourceBankAccountId_fkey" FOREIGN KEY ("sourceBankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destinationBankAccountId_fkey" FOREIGN KEY ("destinationBankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
