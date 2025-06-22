/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ComboPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ComboPlan" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ComboPlan_slug_key" ON "ComboPlan"("slug");
