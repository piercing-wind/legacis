/*
  Warnings:

  - A unique constraint covering the columns `[userId,serviceId,expiryDate]` on the table `UserPurchasedServices` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserPurchasedServices_userId_serviceId_expiryDate_key" ON "UserPurchasedServices"("userId", "serviceId", "expiryDate");
