/*
  Warnings:

  - You are about to drop the column `serviceId` on the `InvestmentAdviosry` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `ServiceResearchAdvisory` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `ServiceResearchAdvisoryModelPortfolio` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `ServiceResearchAdvisoryMutualFunds` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `ServiceResearchAdvisoryPortfolioReview` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the column `aadhar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `panVerifiedAt` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InvestmentAdviosry" DROP CONSTRAINT "InvestmentAdviosry_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceResearchAdvisory" DROP CONSTRAINT "ServiceResearchAdvisory_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceResearchAdvisoryModelPortfolio" DROP CONSTRAINT "ServiceResearchAdvisoryModelPortfolio_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceResearchAdvisoryPortfolioReview" DROP CONSTRAINT "ServiceResearchAdvisoryPortfolioReview_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceTrading" DROP CONSTRAINT "ServiceTrading_serviceId_fkey";

-- DropIndex
DROP INDEX "ComplimentaryService_serviceId_key";

-- DropIndex
DROP INDEX "InvestmentAdviosry_serviceId_key";

-- DropIndex
DROP INDEX "ServiceResearchAdvisory_serviceId_key";

-- DropIndex
DROP INDEX "ServiceResearchAdvisoryModelPortfolio_serviceId_key";

-- DropIndex
DROP INDEX "ServiceResearchAdvisoryPortfolioReview_serviceId_key";

-- DropIndex
DROP INDEX "ServiceTrading_serviceId_key";

-- AlterTable
ALTER TABLE "InvestmentAdviosry" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "ServiceResearchAdvisory" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "ServiceResearchAdvisoryModelPortfolio" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "ServiceResearchAdvisoryMutualFunds" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "ServiceResearchAdvisoryPortfolioReview" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "ServiceTrading" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "aadhar",
DROP COLUMN "panVerifiedAt",
ADD COLUMN     "aadharNumber" TEXT,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "panVerified" TIMESTAMP(3),
ADD COLUMN     "phoneVerified" TIMESTAMP(3),
ADD COLUMN     "termsAccepted" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "KycVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycVerification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KycVerification" ADD CONSTRAINT "KycVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTrading" ADD CONSTRAINT "ServiceTrading_id_fkey" FOREIGN KEY ("id") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceResearchAdvisory" ADD CONSTRAINT "ServiceResearchAdvisory_id_fkey" FOREIGN KEY ("id") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceResearchAdvisoryModelPortfolio" ADD CONSTRAINT "ServiceResearchAdvisoryModelPortfolio_id_fkey" FOREIGN KEY ("id") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceResearchAdvisoryPortfolioReview" ADD CONSTRAINT "ServiceResearchAdvisoryPortfolioReview_id_fkey" FOREIGN KEY ("id") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentAdviosry" ADD CONSTRAINT "InvestmentAdviosry_id_fkey" FOREIGN KEY ("id") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceResearchAdvisoryMutualFunds" ADD CONSTRAINT "ServiceResearchAdvisoryMutualFunds_id_fkey" FOREIGN KEY ("id") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
