/*
  Warnings:

  - You are about to drop the `UserPurchaseHistory` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `planDays` on table `UserPurchasedServices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `planDiscount` on table `UserPurchasedServices` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UserPurchaseHistory" DROP CONSTRAINT "UserPurchaseHistory_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "UserPurchaseHistory" DROP CONSTRAINT "UserPurchaseHistory_userId_fkey";

-- AlterTable
ALTER TABLE "UserPurchasedServices" ALTER COLUMN "planDays" SET NOT NULL,
ALTER COLUMN "planDiscount" SET NOT NULL;

-- DropTable
DROP TABLE "UserPurchaseHistory";
