/*
  Warnings:

  - You are about to drop the column `comboPlanId` on the `ComboPlanService` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `ComboPlanService` table. All the data in the column will be lost.
  - You are about to drop the column `comboPlanId` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `recommendation` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `comboPlanId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `comboPlanId` on the `UserPurchasedServices` table. All the data in the column will be lost.
  - You are about to drop the `ComboPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComboPlanAgreement` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[parentServiceId,childServiceId]` on the table `ComboPlanService` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `childServiceId` to the `ComboPlanService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentServiceId` to the `ComboPlanService` table without a default value. This is not possible if the table is not empty.
  - Made the column `price` on table `Service` required. This step will fail if there are existing NULL values in that column.
  - Made the column `serviceId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `serviceId` on table `UserPurchasedServices` required. This step will fail if there are existing NULL values in that column.

*/

-- First, handle NULL values before making columns required
UPDATE "Transaction" 
SET "serviceId" = (
  SELECT id FROM "Service" 
  WHERE type = 'TRADING' 
  LIMIT 1
) 
WHERE "serviceId" IS NULL;

UPDATE "UserPurchasedServices" 
SET "serviceId" = (
  SELECT id FROM "Service" 
  WHERE type = 'TRADING' 
  LIMIT 1
) 
WHERE "serviceId" IS NULL;

UPDATE "Service" 
SET "price" = 0 
WHERE "price" IS NULL;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceType" ADD VALUE 'COMBO';
ALTER TYPE "ServiceType" ADD VALUE 'PLATINA_WEALTH';

-- DropForeignKey
ALTER TABLE "ComboPlanAgreement" DROP CONSTRAINT "ComboPlanAgreement_agreementId_fkey";

-- DropForeignKey
ALTER TABLE "ComboPlanAgreement" DROP CONSTRAINT "ComboPlanAgreement_comboPlanId_fkey";

-- DropForeignKey
ALTER TABLE "ComboPlanService" DROP CONSTRAINT "ComboPlanService_comboPlanId_fkey";

-- DropForeignKey
ALTER TABLE "ComboPlanService" DROP CONSTRAINT "ComboPlanService_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_comboPlanId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_comboPlanId_fkey";

-- DropForeignKey
ALTER TABLE "UserPurchasedServices" DROP CONSTRAINT "UserPurchasedServices_comboPlanId_fkey";

-- DropIndex
DROP INDEX "ComboPlanService_comboPlanId_serviceId_key";


-- Handle ComboPlanService table changes carefully
-- Step 1: Add new columns as nullable first
ALTER TABLE "ComboPlanService" ADD COLUMN "parentServiceId" TEXT;
ALTER TABLE "ComboPlanService" ADD COLUMN "childServiceId" TEXT;

-- Step 2: Populate the new columns based on existing data
UPDATE "ComboPlanService" 
SET 
  "childServiceId" = "serviceId",
  "parentServiceId" = (
    SELECT id FROM "Service" 
    WHERE type = 'TRADING'
    LIMIT 1
  );

-- Step 3: Make the columns required and drop old columns
ALTER TABLE "ComboPlanService" ALTER COLUMN "parentServiceId" SET NOT NULL;
ALTER TABLE "ComboPlanService" ALTER COLUMN "childServiceId" SET NOT NULL;
ALTER TABLE "ComboPlanService" DROP COLUMN "comboPlanId";
ALTER TABLE "ComboPlanService" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "comboPlanId";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "recommendation",
ADD COLUMN     "recommendedService" TEXT[],
ALTER COLUMN "price" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "comboPlanId",
ALTER COLUMN "serviceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserPurchasedServices" DROP COLUMN "comboPlanId",
ALTER COLUMN "serviceId" SET NOT NULL;

-- DropTable
DROP TABLE "ComboPlan";

-- DropTable
DROP TABLE "ComboPlanAgreement";

-- CreateTable
CREATE TABLE "RiskProfileQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "minScore" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskProfileQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRiskProfileResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRiskProfileResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRiskProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "riskPercentage" DOUBLE PRECISION NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categories" JSONB,
    "recommendations" JSONB,

    CONSTRAINT "UserRiskProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePlatinaWealth" (
    "id" TEXT NOT NULL,
    "minimumInvestment" DOUBLE PRECISION,
    "portfolioTypes" JSONB,
    "features" JSONB,
    "riskBasedAllocation" JSONB,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePlatinaWealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlatinaRecommendations" (
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

    CONSTRAINT "UserPlatinaRecommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRiskProfileResponse_userId_questionId_key" ON "UserRiskProfileResponse"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRiskProfile_userId_key" ON "UserRiskProfile"("userId");

-- CreateIndex
CREATE INDEX "UserPlatinaRecommendations_userId_idx" ON "UserPlatinaRecommendations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlatinaRecommendations_userId_platinaServiceId_key" ON "UserPlatinaRecommendations"("userId", "platinaServiceId");

-- CreateIndex
CREATE INDEX "ComboPlanService_parentServiceId_idx" ON "ComboPlanService"("parentServiceId");

-- CreateIndex
CREATE INDEX "ComboPlanService_childServiceId_idx" ON "ComboPlanService"("childServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "ComboPlanService_parentServiceId_childServiceId_key" ON "ComboPlanService"("parentServiceId", "childServiceId");

-- AddForeignKey
ALTER TABLE "ComboPlanService" ADD CONSTRAINT "ComboPlanService_parentServiceId_fkey" FOREIGN KEY ("parentServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboPlanService" ADD CONSTRAINT "ComboPlanService_childServiceId_fkey" FOREIGN KEY ("childServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRiskProfileResponse" ADD CONSTRAINT "UserRiskProfileResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRiskProfileResponse" ADD CONSTRAINT "UserRiskProfileResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "RiskProfileQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRiskProfile" ADD CONSTRAINT "UserRiskProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePlatinaWealth" ADD CONSTRAINT "ServicePlatinaWealth_id_fkey" FOREIGN KEY ("id") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatinaRecommendations" ADD CONSTRAINT "UserPlatinaRecommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatinaRecommendations" ADD CONSTRAINT "UserPlatinaRecommendations_platinaServiceId_fkey" FOREIGN KEY ("platinaServiceId") REFERENCES "ServicePlatinaWealth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatinaRecommendations" ADD CONSTRAINT "UserPlatinaRecommendations_riskProfileId_fkey" FOREIGN KEY ("riskProfileId") REFERENCES "UserRiskProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
