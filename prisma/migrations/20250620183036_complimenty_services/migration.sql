/*
  Warnings:

  - You are about to drop the `ComboPlanService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ComboPlanService" DROP CONSTRAINT "ComboPlanService_childServiceId_fkey";

-- DropForeignKey
ALTER TABLE "ComboPlanService" DROP CONSTRAINT "ComboPlanService_parentServiceId_fkey";

-- DropTable
DROP TABLE "ComboPlanService";

-- CreateTable
CREATE TABLE "ComplimentaryService" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "complimentaryServiceId" TEXT NOT NULL,

    CONSTRAINT "ComplimentaryService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplimentaryService_serviceId_idx" ON "ComplimentaryService"("serviceId");

-- CreateIndex
CREATE INDEX "ComplimentaryService_complimentaryServiceId_idx" ON "ComplimentaryService"("complimentaryServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplimentaryService_serviceId_complimentaryServiceId_key" ON "ComplimentaryService"("serviceId", "complimentaryServiceId");

-- AddForeignKey
ALTER TABLE "ComplimentaryService" ADD CONSTRAINT "ComplimentaryService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplimentaryService" ADD CONSTRAINT "ComplimentaryService_complimentaryServiceId_fkey" FOREIGN KEY ("complimentaryServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
