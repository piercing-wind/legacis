/*
  Warnings:

  - You are about to drop the column `agreementAcceptedAt` on the `UserPurchasedServices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "agreementAcceptedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserPurchasedServices" DROP COLUMN "agreementAcceptedAt";
