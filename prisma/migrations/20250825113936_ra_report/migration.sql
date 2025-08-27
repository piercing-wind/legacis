/*
  Warnings:

  - You are about to drop the column `raResearchReport` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ResearchAdvisoryStockList" ADD COLUMN     "raReport" TEXT;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "raResearchReport";
