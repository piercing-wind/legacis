-- CreateEnum
CREATE TYPE "GrantType" AS ENUM ('PURCHASED', 'COMPLIMENTARY', 'ADMIN_GRANTED');

-- AlterTable
ALTER TABLE "UserPurchasedServices" ADD COLUMN     "grantMetadata" JSONB,
ADD COLUMN     "grantReason" TEXT,
ADD COLUMN     "grantType" "GrantType" NOT NULL DEFAULT 'PURCHASED',
ADD COLUMN     "grantedBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "parentServiceId" TEXT,
ADD COLUMN     "transactionId" TEXT;
