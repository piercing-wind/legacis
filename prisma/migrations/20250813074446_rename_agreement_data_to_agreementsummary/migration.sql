/*
  Warnings:

  - You are about to drop the column `agreementData` on the `UserPurchasedServices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPurchasedServices" DROP COLUMN "agreementData",
ADD COLUMN     "agreementSummary" JSONB;
