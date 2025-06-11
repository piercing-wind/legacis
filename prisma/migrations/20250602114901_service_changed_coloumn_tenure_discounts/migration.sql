/*
  Warnings:

  - You are about to drop the column `discountedPrice` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `tenure` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "discountedPrice",
DROP COLUMN "tenure",
ADD COLUMN     "tenureDiscounts" JSONB;
