/*
  Warnings:

  - You are about to drop the column `agreementId` on the `ComboPlan` table. All the data in the column will be lost.
  - You are about to drop the column `agreementId` on the `Service` table. All the data in the column will be lost.
  - Made the column `minAmount` on table `Coupon` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ComboPlan" DROP CONSTRAINT "ComboPlan_agreementId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_agreementId_fkey";

-- AlterTable
ALTER TABLE "ComboPlan" DROP COLUMN "agreementId";

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "minAmount" SET NOT NULL,
ALTER COLUMN "minAmount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "agreementId";

-- AlterTable
ALTER TABLE "UserPurchasedServices" ADD COLUMN     "agreementData" JSONB;

-- CreateTable
CREATE TABLE "ServiceAgreement" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,

    CONSTRAINT "ServiceAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboPlanAgreement" (
    "id" TEXT NOT NULL,
    "comboPlanId" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,

    CONSTRAINT "ComboPlanAgreement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceAgreement" ADD CONSTRAINT "ServiceAgreement_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAgreement" ADD CONSTRAINT "ServiceAgreement_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboPlanAgreement" ADD CONSTRAINT "ComboPlanAgreement_comboPlanId_fkey" FOREIGN KEY ("comboPlanId") REFERENCES "ComboPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboPlanAgreement" ADD CONSTRAINT "ComboPlanAgreement_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
