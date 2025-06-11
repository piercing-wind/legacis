/*
  Warnings:

  - You are about to drop the `KycVerification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "KycVerification" DROP CONSTRAINT "KycVerification_userId_fkey";

-- DropTable
DROP TABLE "KycVerification";

-- CreateTable
CREATE TABLE "panVerificationData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "panVerificationData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "panVerificationData" ADD CONSTRAINT "panVerificationData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
