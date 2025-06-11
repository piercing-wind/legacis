-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_VERIFY', 'PHONE_VERIFY', 'EMAIL_UPDATE', 'PHONE_UPDATE', 'VERIFY');

-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "verificationType" "VerificationType" NOT NULL DEFAULT 'VERIFY';
