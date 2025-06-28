/*
  Warnings:

  - You are about to drop the column `maxScore` on the `RiskProfileQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `minScore` on the `RiskProfileQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `RiskProfileQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RiskProfileQuestion" DROP COLUMN "maxScore",
DROP COLUMN "minScore",
DROP COLUMN "weight";
