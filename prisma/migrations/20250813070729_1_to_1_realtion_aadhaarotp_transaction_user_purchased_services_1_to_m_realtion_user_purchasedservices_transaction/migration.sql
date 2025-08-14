/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `AadhaarOtp` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AadhaarOtp" ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AadhaarOtp_transactionId_key" ON "AadhaarOtp"("transactionId");

-- AddForeignKey
ALTER TABLE "AadhaarOtp" ADD CONSTRAINT "AadhaarOtp_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPurchasedServices" ADD CONSTRAINT "UserPurchasedServices_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
