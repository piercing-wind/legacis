/*
  Warnings:

  - The `category` column on the `RiskProfileQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('NORMAL', 'PLATINA_WEALTH');

-- AlterTable
ALTER TABLE "RiskProfileQuestion" DROP COLUMN "category",
ADD COLUMN     "category" "QuestionCategory" NOT NULL DEFAULT 'NORMAL';
