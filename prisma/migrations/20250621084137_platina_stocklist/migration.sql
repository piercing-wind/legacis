/*
  Warnings:

  - You are about to drop the column `investmentGoals` on the `UserPlatinaRecommendation` table. All the data in the column will be lost.
  - You are about to drop the column `stockRecommendations` on the `UserPlatinaRecommendation` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StockChangeType" AS ENUM ('ADDED', 'UPDATED', 'REMOVED', 'INITIAL');

-- AlterTable
ALTER TABLE "UserPlatinaRecommendation" DROP COLUMN "investmentGoals",
DROP COLUMN "stockRecommendations",
ADD COLUMN     "userInvestmentAmount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "UserPlatinaStockList" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "stockName" TEXT NOT NULL,
    "stockTicker" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "portfolioWeight" DOUBLE PRECISION NOT NULL,
    "totalShares" INTEGER NOT NULL,
    "currentSharePrice" DOUBLE PRECISION NOT NULL,
    "purchaseAmount" DOUBLE PRECISION NOT NULL,
    "marketValue" DOUBLE PRECISION NOT NULL,
    "PEratio" DOUBLE PRECISION NOT NULL,
    "marketCapInCrore" DOUBLE PRECISION NOT NULL,
    "entryDate" TEXT NOT NULL,
    "exitDate" TEXT,
    "recordDate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "changeType" "StockChangeType" DEFAULT 'INITIAL',

    CONSTRAINT "UserPlatinaStockList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPlatinaStockList_recommendationId_idx" ON "UserPlatinaStockList"("recommendationId");

-- CreateIndex
CREATE INDEX "UserPlatinaStockList_stockTicker_idx" ON "UserPlatinaStockList"("stockTicker");

-- CreateIndex
CREATE INDEX "UserPlatinaStockList_isActive_idx" ON "UserPlatinaStockList"("isActive");

-- AddForeignKey
ALTER TABLE "UserPlatinaStockList" ADD CONSTRAINT "UserPlatinaStockList_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "UserPlatinaRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
