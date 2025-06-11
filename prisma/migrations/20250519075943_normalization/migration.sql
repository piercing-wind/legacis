/*
  Warnings:

  - You are about to drop the column `description` on the `InvestmentAdviosry` table. All the data in the column will be lost.
  - You are about to drop the column `feature` on the `InvestmentAdviosry` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `InvestmentAdviosry` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `InvestmentAdviosry` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ServiceResearchAdvisory` table. All the data in the column will be lost.
  - You are about to drop the column `feature` on the `ServiceResearchAdvisory` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ServiceResearchAdvisory` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `ServiceResearchAdvisory` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ServiceResearchAdvisoryModelPortfolio` table. All the data in the column will be lost.
  - You are about to drop the column `feature` on the `ServiceResearchAdvisoryModelPortfolio` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ServiceResearchAdvisoryModelPortfolio` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `ServiceResearchAdvisoryModelPortfolio` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ServiceResearchAdvisoryMutualFunds` table. All the data in the column will be lost.
  - You are about to drop the column `feature` on the `ServiceResearchAdvisoryMutualFunds` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ServiceResearchAdvisoryMutualFunds` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `ServiceResearchAdvisoryMutualFunds` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ServiceResearchAdvisoryPortfolioReview` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ServiceResearchAdvisoryPortfolioReview` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `ServiceResearchAdvisoryPortfolioReview` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the column `feature` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `ServiceTrading` table. All the data in the column will be lost.
  - Added the required column `serviceHighlights` to the `InvestmentAdviosry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceHighlights` to the `ServiceResearchAdvisory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceHighlights` to the `ServiceResearchAdvisoryModelPortfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceHighlights` to the `ServiceResearchAdvisoryMutualFunds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceHighlights` to the `ServiceTrading` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('TRADING', 'RESEARCH_ADVISORY', 'RESEARCH_ADVISORY_MODEL_PORTFOLIO', 'RESEARCH_ADVISORY_PORTFOLIO_REVIEW', 'INVESTMENT_ADVISORY', 'RESEARCH_ADVISORY_MUTUAL_FUNDS');

-- AlterTable
ALTER TABLE "InvestmentAdviosry" DROP COLUMN "description",
DROP COLUMN "feature",
DROP COLUMN "name",
DROP COLUMN "tag",
ADD COLUMN     "serviceHighlights" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "tag" TEXT,
ADD COLUMN     "type" "ServiceType" NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ServiceResearchAdvisory" DROP COLUMN "description",
DROP COLUMN "feature",
DROP COLUMN "name",
DROP COLUMN "tag",
ADD COLUMN     "serviceHighlights" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ServiceResearchAdvisoryModelPortfolio" DROP COLUMN "description",
DROP COLUMN "feature",
DROP COLUMN "name",
DROP COLUMN "tag",
ADD COLUMN     "serviceHighlights" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ServiceResearchAdvisoryMutualFunds" DROP COLUMN "description",
DROP COLUMN "feature",
DROP COLUMN "name",
DROP COLUMN "tag",
ADD COLUMN     "serviceHighlights" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ServiceResearchAdvisoryPortfolioReview" DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "tag";

-- AlterTable
ALTER TABLE "ServiceTrading" DROP COLUMN "description",
DROP COLUMN "feature",
DROP COLUMN "name",
DROP COLUMN "tag",
ADD COLUMN     "serviceHighlights" JSONB NOT NULL;
