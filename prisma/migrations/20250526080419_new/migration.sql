/*
  Warnings:

  - A unique constraint covering the columns `[userId,identifier,verificationType]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Otp_userId_identifier_key";

-- CreateIndex
CREATE UNIQUE INDEX "Otp_userId_identifier_verificationType_key" ON "Otp"("userId", "identifier", "verificationType");
