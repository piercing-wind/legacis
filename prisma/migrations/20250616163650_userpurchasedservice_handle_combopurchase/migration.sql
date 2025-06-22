/*
  Warnings:

  - The `price` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "UserPurchasedServices" DROP CONSTRAINT "UserPurchasedServices_serviceId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "price",
ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UserPurchasedServices" ADD COLUMN     "comboPlanId" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserPurchasedServices" ADD CONSTRAINT "UserPurchasedServices_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPurchasedServices" ADD CONSTRAINT "UserPurchasedServices_comboPlanId_fkey" FOREIGN KEY ("comboPlanId") REFERENCES "ComboPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
