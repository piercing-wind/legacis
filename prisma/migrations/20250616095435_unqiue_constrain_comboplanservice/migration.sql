/*
  Warnings:

  - A unique constraint covering the columns `[comboPlanId,serviceId]` on the table `ComboPlanService` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ComboPlanService_comboPlanId_serviceId_key" ON "ComboPlanService"("comboPlanId", "serviceId");
