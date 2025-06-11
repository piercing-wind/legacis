/*
  Warnings:

  - The values [VERIFY] on the enum `VerificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VerificationType_new" AS ENUM ('EMAIL_UPDATE', 'PHONE_UPDATE', 'EMAIL_VERIFY', 'PHONE_VERIFY', 'RESET_PASS_VERIFY', 'CONSENT');
ALTER TABLE "Otp" ALTER COLUMN "verificationType" DROP DEFAULT;
ALTER TABLE "Otp" ALTER COLUMN "verificationType" TYPE "VerificationType_new" USING ("verificationType"::text::"VerificationType_new");
ALTER TYPE "VerificationType" RENAME TO "VerificationType_old";
ALTER TYPE "VerificationType_new" RENAME TO "VerificationType";
DROP TYPE "VerificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "verificationType" DROP DEFAULT;
