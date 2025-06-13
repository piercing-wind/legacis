/*
  Warnings:

  - Made the column `hash` on table `Agreement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `version` on table `Agreement` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Agreement" ALTER COLUMN "hash" SET NOT NULL,
ALTER COLUMN "version" SET NOT NULL;
