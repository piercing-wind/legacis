/*
  Warnings:

  - You are about to drop the column `consentGiven` on the `UserRiskProfileResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserRiskProfile" ADD COLUMN     "consentGiven" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserRiskProfileResponse" DROP COLUMN "consentGiven";
