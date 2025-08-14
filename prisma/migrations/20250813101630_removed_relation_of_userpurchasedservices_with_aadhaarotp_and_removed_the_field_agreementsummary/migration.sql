/*
  Warnings:

  - You are about to drop the column `userPurchasedServiceId` on the `AadhaarOtp` table. All the data in the column will be lost.
  - You are about to drop the column `agreementSummary` on the `UserPurchasedServices` table. All the data in the column will be lost.
  - You are about to drop the `UserPurchasedServiceAgreement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AadhaarOtp" DROP CONSTRAINT "AadhaarOtp_userPurchasedServiceId_fkey";

-- DropForeignKey
ALTER TABLE "UserPurchasedServiceAgreement" DROP CONSTRAINT "UserPurchasedServiceAgreement_agreementId_fkey";

-- DropForeignKey
ALTER TABLE "UserPurchasedServiceAgreement" DROP CONSTRAINT "UserPurchasedServiceAgreement_userPurchasedServiceId_fkey";

-- DropIndex
DROP INDEX "AadhaarOtp_userPurchasedServiceId_key";

-- AlterTable
ALTER TABLE "AadhaarOtp" DROP COLUMN "userPurchasedServiceId";

-- AlterTable
ALTER TABLE "UserPurchasedServices" DROP COLUMN "agreementSummary";

-- DropTable
DROP TABLE "UserPurchasedServiceAgreement";
