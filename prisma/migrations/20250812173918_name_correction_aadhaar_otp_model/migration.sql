/*
  Warnings:

  - You are about to drop the column `verifyOTPResponse` on the `AadhaarOtp` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AadhaarOtp" DROP COLUMN "verifyOTPResponse",
ADD COLUMN     "verifiedOTPResponse" JSONB;
