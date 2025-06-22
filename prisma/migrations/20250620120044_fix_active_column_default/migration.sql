/*
  Warnings:

  - Made the column `active` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
UPDATE "Service" 
SET "active" = true 
WHERE "active" IS NULL;
-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "active" SET NOT NULL,
ALTER COLUMN "active" SET DEFAULT true;
