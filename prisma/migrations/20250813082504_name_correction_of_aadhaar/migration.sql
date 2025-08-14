/*
  Warnings:

  - You are about to drop the column `aadharNumber` on the `AadhaarOtp` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AadhaarOtp" DROP COLUMN "aadharNumber",
ADD COLUMN     "aadhaarNumber" TEXT;
