/*
  Warnings:

  - The `status` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[orderId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "comboPlanId" TEXT,
ADD COLUMN     "planDays" INTEGER,
ADD COLUMN     "serviceId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "couponId" TEXT,
ADD COLUMN     "webhookResponse" JSONB,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT;

-- DropEnum
DROP TYPE "TransactionStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_orderId_key" ON "Transaction"("orderId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_orderId_idx" ON "Transaction"("orderId");

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_comboPlanId_fkey" FOREIGN KEY ("comboPlanId") REFERENCES "ComboPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
