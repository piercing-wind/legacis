/*
  Warnings:

  - You are about to drop the column `duration` on the `ServiceTrading` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ServiceTrading` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceTrading" DROP COLUMN "duration",
DROP COLUMN "price";

-- AlterTable
ALTER TABLE "UserPurchasedServices" ADD COLUMN     "planDays" INTEGER,
ADD COLUMN     "planDiscount" DOUBLE PRECISION;
