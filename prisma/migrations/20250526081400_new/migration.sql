/*
  Warnings:

  - The values [EMAIL_VERIFY,PHONE_VERIFY] on the enum `VerificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VerificationType_new" AS ENUM ('EMAIL_UPDATE', 'PHONE_UPDATE', 'VERIFY');
ALTER TABLE "Otp" ALTER COLUMN "verificationType" DROP DEFAULT;
ALTER TABLE "Otp" ALTER COLUMN "verificationType" TYPE "VerificationType_new" USING ("verificationType"::text::"VerificationType_new");
ALTER TYPE "VerificationType" RENAME TO "VerificationType_old";
ALTER TYPE "VerificationType_new" RENAME TO "VerificationType";
DROP TYPE "VerificationType_old";
ALTER TABLE "Otp" ALTER COLUMN "verificationType" SET DEFAULT 'VERIFY';
COMMIT;
