/*
  Warnings:

  - You are about to drop the column `category` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the column `chart` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the column `discountedPrice` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the column `faq` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the column `recommendation` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the column `serviceHighlights` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the `ComplimentaryService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvestmentAdviosry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceResearchAdvisory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceResearchAdvisoryModelPortfolio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceResearchAdvisoryMutualFunds` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceResearchAdvisoryPortfolioReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "ServiceType" ADD VALUE 'SMALLCASE';

-- DropForeignKey
ALTER TABLE "ComplimentaryService" DROP CONSTRAINT "ComplimentaryService_investmentAdvisoryId_fkey";

-- DropForeignKey
ALTER TABLE "ComplimentaryService" DROP CONSTRAINT "ComplimentaryService_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "InvestmentAdviosry" DROP CONSTRAINT "InvestmentAdviosry_id_fkey";

-- DropForeignKey
ALTER TABLE "ServiceResearchAdvisory" DROP CONSTRAINT "ServiceResearchAdvisory_id_fkey";

-- DropForeignKey
ALTER TABLE "ServiceResearchAdvisoryModelPortfolio" DROP CONSTRAINT "ServiceResearchAdvisoryModelPortfolio_id_fkey";

-- DropForeignKey
ALTER TABLE "ServiceResearchAdvisoryMutualFunds" DROP CONSTRAINT "ServiceResearchAdvisoryMutualFunds_id_fkey";

-- DropForeignKey
ALTER TABLE "ServiceResearchAdvisoryPortfolioReview" DROP CONSTRAINT "ServiceResearchAdvisoryPortfolioReview_id_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "category",
ADD COLUMN     "active" BOOLEAN,
ADD COLUMN     "chart" JSONB,
ADD COLUMN     "discountedPrice" DOUBLE PRECISION,
ADD COLUMN     "faq" JSONB,
ADD COLUMN     "features" JSONB,
ADD COLUMN     "price" TEXT,
ADD COLUMN     "recommendation" TEXT[],
ADD COLUMN     "tenure" INTEGER;

-- AlterTable
ALTER TABLE "ServiceTrading" DROP COLUMN "active",
DROP COLUMN "chart",
DROP COLUMN "discountedPrice",
DROP COLUMN "faq",
DROP COLUMN "recommendation",
DROP COLUMN "serviceHighlights";

-- DropTable
DROP TABLE "ComplimentaryService";

-- DropTable
DROP TABLE "InvestmentAdviosry";

-- DropTable
DROP TABLE "ServiceResearchAdvisory";

-- DropTable
DROP TABLE "ServiceResearchAdvisoryModelPortfolio";

-- DropTable
DROP TABLE "ServiceResearchAdvisoryMutualFunds";

-- DropTable
DROP TABLE "ServiceResearchAdvisoryPortfolioReview";
