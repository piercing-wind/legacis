/*
  Warnings:

  - The primary key for the `panVerificationData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `panVerificationData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "panVerificationData" DROP CONSTRAINT "panVerificationData_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "panVerificationData_pkey" PRIMARY KEY ("userId");
