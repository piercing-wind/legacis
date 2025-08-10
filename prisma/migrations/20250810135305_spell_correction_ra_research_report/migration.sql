/*
  Warnings:

  - You are about to drop the column `raResearchResport` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "raResearchResport",
ADD COLUMN     "raResearchReport" JSONB;
