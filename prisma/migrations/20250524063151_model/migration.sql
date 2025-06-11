/*
  Warnings:

  - A unique constraint covering the columns `[userId,email]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Otp_userId_email_key" ON "Otp"("userId", "email");
