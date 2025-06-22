/*
  Warnings:

  - You are about to drop the `UserPlatinaRecommendations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPlatinaRecommendations" DROP CONSTRAINT "UserPlatinaRecommendations_platinaServiceId_fkey";

-- DropForeignKey
ALTER TABLE "UserPlatinaRecommendations" DROP CONSTRAINT "UserPlatinaRecommendations_riskProfileId_fkey";

-- DropForeignKey
ALTER TABLE "UserPlatinaRecommendations" DROP CONSTRAINT "UserPlatinaRecommendations_userId_fkey";

-- DropTable
DROP TABLE "UserPlatinaRecommendations";

-- CreateTable
CREATE TABLE "UserPlatinaRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platinaServiceId" TEXT NOT NULL,
    "stockRecommendations" JSONB NOT NULL,
    "riskProfileId" TEXT,
    "portfolioType" TEXT,
    "assetAllocation" JSONB,
    "investmentGoals" JSONB,
    "recommendationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlatinaRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPlatinaRecommendation_userId_idx" ON "UserPlatinaRecommendation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlatinaRecommendation_userId_platinaServiceId_key" ON "UserPlatinaRecommendation"("userId", "platinaServiceId");

-- AddForeignKey
ALTER TABLE "UserPlatinaRecommendation" ADD CONSTRAINT "UserPlatinaRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatinaRecommendation" ADD CONSTRAINT "UserPlatinaRecommendation_platinaServiceId_fkey" FOREIGN KEY ("platinaServiceId") REFERENCES "ServicePlatinaWealth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatinaRecommendation" ADD CONSTRAINT "UserPlatinaRecommendation_riskProfileId_fkey" FOREIGN KEY ("riskProfileId") REFERENCES "UserRiskProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
