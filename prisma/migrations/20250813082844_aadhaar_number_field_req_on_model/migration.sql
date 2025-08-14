/*
  Warnings:

  - Made the column `aadhaarNumber` on table `AadhaarOtp` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AadhaarOtp" ALTER COLUMN "aadhaarNumber" SET NOT NULL;
