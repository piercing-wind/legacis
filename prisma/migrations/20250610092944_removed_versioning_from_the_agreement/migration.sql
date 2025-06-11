/*
  Warnings:

  - You are about to drop the column `version` on the `Agreement` table. All the data in the column will be lost.
  - Added the required column `name` to the `Agreement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agreement" DROP COLUMN "version",
ADD COLUMN     "name" TEXT NOT NULL;
