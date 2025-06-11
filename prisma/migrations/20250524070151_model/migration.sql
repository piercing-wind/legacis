/*
  Warnings:

  - You are about to drop the column `email` on the `Otp` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,identifier]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifier` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Otp_userId_email_idx";

-- DropIndex
DROP INDEX "Otp_userId_email_key";

-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "email",
ADD COLUMN     "identifier" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Otp_userId_identifier_idx" ON "Otp"("userId", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_userId_identifier_key" ON "Otp"("userId", "identifier");
