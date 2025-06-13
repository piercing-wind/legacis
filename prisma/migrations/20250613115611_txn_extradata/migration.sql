-- AlterTable
ALTER TABLE "Agreement" ADD COLUMN     "hash" TEXT,
ADD COLUMN     "version" INTEGER;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "extraData" JSONB;
