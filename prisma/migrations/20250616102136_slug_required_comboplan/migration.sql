/*
  Warnings:

  - Made the column `slug` on table `ComboPlan` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ComboPlan" ALTER COLUMN "slug" SET NOT NULL;
