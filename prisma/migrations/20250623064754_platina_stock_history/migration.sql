/*
  Warnings:

  - You are about to drop the column `changeType` on the `UserPlatinaStockList` table. All the data in the column will be lost.
  - You are about to drop the column `recordDate` on the `UserPlatinaStockList` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPlatinaStockList" DROP COLUMN "changeType",
DROP COLUMN "recordDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "UserPlatinaStockHistory" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "stockTicker" TEXT NOT NULL,
    "stockName" TEXT NOT NULL,
    "changeType" "StockChangeType" NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousWeight" DOUBLE PRECISION,
    "newWeight" DOUBLE PRECISION,
    "changeDescription" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "UserPlatinaStockHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPlatinaStockHistory_recommendationId_idx" ON "UserPlatinaStockHistory"("recommendationId");

-- CreateIndex
CREATE INDEX "UserPlatinaStockHistory_changeDate_idx" ON "UserPlatinaStockHistory"("changeDate");

-- CreateIndex
CREATE INDEX "UserPlatinaStockHistory_stockTicker_idx" ON "UserPlatinaStockHistory"("stockTicker");

-- CreateIndex
CREATE INDEX "UserPlatinaStockHistory_changeType_idx" ON "UserPlatinaStockHistory"("changeType");

-- AddForeignKey
ALTER TABLE "UserPlatinaStockHistory" ADD CONSTRAINT "UserPlatinaStockHistory_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "UserPlatinaRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
