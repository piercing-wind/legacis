/*
  Warnings:

  - You are about to drop the column `userPurchasedServicesId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `UserPurchasedServices` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userPurchasedServicesId_fkey";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "agreementId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "userPurchasedServicesId",
ADD COLUMN     "comboPlanId" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserPurchasedServices" DROP COLUMN "status",
ADD COLUMN     "agreementAcceptedAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "PurchaseStatus";

-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "agreementId" TEXT,
    "tenureDiscounts" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComboPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboPlanService" (
    "id" TEXT NOT NULL,
    "comboPlanId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ComboPlanService_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_comboPlanId_fkey" FOREIGN KEY ("comboPlanId") REFERENCES "ComboPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboPlan" ADD CONSTRAINT "ComboPlan_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboPlanService" ADD CONSTRAINT "ComboPlanService_comboPlanId_fkey" FOREIGN KEY ("comboPlanId") REFERENCES "ComboPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboPlanService" ADD CONSTRAINT "ComboPlanService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
