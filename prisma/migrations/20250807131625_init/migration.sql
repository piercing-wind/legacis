-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CLOSED_CALL', 'ACTIVE_CALL');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('COMBO', 'RESEARCH_ADVISORY', 'RESEARCH_ADVISORY_MODEL_PORTFOLIO', 'RESEARCH_ADVISORY_MUTUAL_FUNDS', 'PORTFOLIO_REVIEW', 'SMALLCASE', 'PLATINA_WEALTH');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_UPDATE', 'PHONE_UPDATE', 'EMAIL_VERIFY', 'PHONE_VERIFY', 'RESET_PASS_VERIFY', 'CONSENT', 'AGREEMENT_ACCEPTANCE');

-- CreateEnum
CREATE TYPE "GrantType" AS ENUM ('PURCHASED', 'COMPLIMENTARY', 'ADMIN_GRANTED');

-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('AGREEMENT', 'POLICY');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('TERMS_AND_CONDITIONS', 'PRIVACY_POLICY', 'REFUND_POLICY', 'COOKIE_POLICY', 'DISCLOSURE_RA', 'DISCLOSURE_IA', 'GRIEVANCE_REDRESSAL', 'INVESTOR_CHARTER');

-- CreateEnum
CREATE TYPE "PortfolioReviewStatus" AS ENUM ('PENDING_UPLOAD', 'UNDER_REVIEW', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ResearchAdvisoryStockStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'SCALE', 'YES_NO', 'TEXT');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('NORMAL', 'PLATINA_WEALTH');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE');

-- CreateEnum
CREATE TYPE "StockChangeType" AS ENUM ('ADDED', 'UPDATED', 'REMOVED', 'INITIAL');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "username" TEXT,
    "image" TEXT,
    "password" TEXT,
    "dob" TEXT,
    "pan" TEXT,
    "aadharNumber" TEXT,
    "gstin" TEXT,
    "address" TEXT,
    "state" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "panVerified" TIMESTAMP(3),
    "termsAccepted" TIMESTAMP(3),
    "emailVerified" TIMESTAMP(3),
    "phoneVerified" TIMESTAMP(3),
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "userType" "UserType" NOT NULL DEFAULT 'INDIVIDUAL',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verificationType" "VerificationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panVerificationData" (
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "panVerificationData_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserPurchasedServices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "servicePlanId" TEXT,
    "agreementAcceptedAt" TIMESTAMP(3),
    "agreementData" JSONB,
    "grantType" "GrantType" NOT NULL DEFAULT 'PURCHASED',
    "grantedBy" TEXT,
    "grantReason" TEXT,
    "parentServiceId" TEXT,
    "transactionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "grantMetadata" JSONB,

    CONSTRAINT "UserPurchasedServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "percentOff" DOUBLE PRECISION NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "serviceId" TEXT,
    "servicePlanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "paymentId" TEXT,
    "couponId" TEXT,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "servicePlanId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "paymentGateway" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "webhookResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "extraData" JSONB,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "type" "AgreementType" NOT NULL DEFAULT 'AGREEMENT',
    "policyType" "PolicyType",
    "signatoryPerson" TEXT,
    "companyName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAgreement" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,

    CONSTRAINT "ServiceAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplimentaryService" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "complimentaryServiceId" TEXT NOT NULL,
    "complimentaryServicePlanId" TEXT,

    CONSTRAINT "ComplimentaryService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePlan" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "durationInDays" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stockLimit" INTEGER,

    CONSTRAINT "ServicePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "tag" TEXT,
    "label" TEXT,
    "serviceClass" TEXT,
    "description" TEXT,
    "chart" JSONB,
    "comparisonTitle" TEXT,
    "philosophy" JSONB,
    "recommendedService" TEXT[],
    "taxPercent" DOUBLE PRECISION,
    "features" JSONB,
    "faq" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" "ServiceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "afterPurchaseFeaturesDelta" JSONB,
    "detailMutualFundPageDelta" JSONB,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioReview" (
    "id" TEXT NOT NULL,
    "userPurchasedServiceId" TEXT NOT NULL,
    "status" "PortfolioReviewStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "userId" TEXT NOT NULL,
    "uploadedFileName" TEXT,
    "uploadedFileUrl" TEXT,
    "stockCount" INTEGER,
    "reviewedFileName" TEXT,
    "reviewedFileUrl" TEXT,
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchAdvisoryStockList" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stockTicker" TEXT NOT NULL,
    "sector" TEXT,
    "status" "ResearchAdvisoryStockStatus" NOT NULL,
    "callType" "CallType" NOT NULL,
    "entryPrice" DOUBLE PRECISION,
    "targetPrice" DOUBLE PRECISION,
    "stopLoss" DOUBLE PRECISION,
    "rationale" JSONB,
    "exitRationale" JSONB,
    "exitDate" TIMESTAMP(3),
    "entryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchAdvisoryStockList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchAdvisoryModelPortfolioStockList" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stockTicker" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "portfolioWeight" DOUBLE PRECISION NOT NULL,
    "researchReport" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchAdvisoryModelPortfolioStockList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchAdvisoryMutualFundStockList" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "rationale" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchAdvisoryMutualFundStockList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskProfileQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "options" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "category" "QuestionCategory" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskProfileQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRiskProfileResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRiskProfileResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRiskProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel",
    "riskPercentage" DOUBLE PRECISION NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "isAnsweredPlatinaQues" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRiskLevelAdminSet" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserRiskProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskLevelServiceRecommendation" (
    "id" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "services" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskLevelServiceRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePlatinaWealth" (
    "id" TEXT NOT NULL,
    "minimumInvestment" DOUBLE PRECISION,
    "portfolioTypes" JSONB,
    "features" JSONB,
    "riskBasedAllocation" JSONB,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePlatinaWealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlatinaRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platinaServiceId" TEXT NOT NULL,
    "riskProfileId" TEXT,
    "portfolioType" TEXT,
    "assetAllocation" JSONB,
    "userInvestmentAmount" DOUBLE PRECISION,
    "nextRecommendationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rationale" JSONB,
    "peChart" JSONB,
    "epsChart" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlatinaRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlatinaStockList" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "stockName" TEXT NOT NULL,
    "stockTicker" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "portfolioWeight" DOUBLE PRECISION NOT NULL,
    "totalShares" INTEGER NOT NULL,
    "currentSharePrice" DOUBLE PRECISION NOT NULL,
    "purchaseAmount" DOUBLE PRECISION NOT NULL,
    "marketValue" DOUBLE PRECISION NOT NULL,
    "PEratio" DOUBLE PRECISION NOT NULL,
    "marketCapInCrore" DOUBLE PRECISION NOT NULL,
    "entryDate" TEXT NOT NULL,
    "exitDate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPlatinaStockList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlatinaStockHistory" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "stockTicker" TEXT NOT NULL,
    "stockName" TEXT NOT NULL,
    "changeType" "StockChangeType" NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousWeight" DOUBLE PRECISION,
    "newWeight" DOUBLE PRECISION,
    "changeDescription" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "UserPlatinaStockHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB NOT NULL,
    "featuredImage" TEXT,
    "authorId" TEXT,
    "category" TEXT[],
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "buttonLabel" TEXT NOT NULL,
    "buttonUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_pan_key" ON "User"("pan");

-- CreateIndex
CREATE INDEX "Otp_userId_identifier_idx" ON "Otp"("userId", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_userId_identifier_verificationType_key" ON "Otp"("userId", "identifier", "verificationType");

-- CreateIndex
CREATE UNIQUE INDEX "UserPurchasedServices_userId_serviceId_expiryDate_key" ON "UserPurchasedServices"("userId", "serviceId", "expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_orderId_key" ON "Transaction"("orderId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_orderId_idx" ON "Transaction"("orderId");

-- CreateIndex
CREATE INDEX "ComplimentaryService_serviceId_idx" ON "ComplimentaryService"("serviceId");

-- CreateIndex
CREATE INDEX "ComplimentaryService_complimentaryServiceId_idx" ON "ComplimentaryService"("complimentaryServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplimentaryService_serviceId_complimentaryServiceId_key" ON "ComplimentaryService"("serviceId", "complimentaryServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioReview_userPurchasedServiceId_key" ON "PortfolioReview"("userPurchasedServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRiskProfileResponse_userId_questionId_key" ON "UserRiskProfileResponse"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRiskProfile_userId_key" ON "UserRiskProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskLevelServiceRecommendation_riskLevel_key" ON "RiskLevelServiceRecommendation"("riskLevel");

-- CreateIndex
CREATE INDEX "UserPlatinaRecommendation_userId_idx" ON "UserPlatinaRecommendation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlatinaRecommendation_userId_platinaServiceId_key" ON "UserPlatinaRecommendation"("userId", "platinaServiceId");

-- CreateIndex
CREATE INDEX "UserPlatinaStockList_recommendationId_idx" ON "UserPlatinaStockList"("recommendationId");

-- CreateIndex
CREATE INDEX "UserPlatinaStockList_stockTicker_idx" ON "UserPlatinaStockList"("stockTicker");

-- CreateIndex
CREATE INDEX "UserPlatinaStockList_isActive_idx" ON "UserPlatinaStockList"("isActive");

-- CreateIndex
CREATE INDEX "UserPlatinaStockHistory_recommendationId_idx" ON "UserPlatinaStockHistory"("recommendationId");

-- CreateIndex
CREATE INDEX "UserPlatinaStockHistory_changeDate_idx" ON "UserPlatinaStockHistory"("changeDate");

-- CreateIndex
CREATE INDEX "UserPlatinaStockHistory_stockTicker_idx" ON "UserPlatinaStockHistory"("stockTicker");

-- CreateIndex
CREATE INDEX "UserPlatinaStockHistory_changeType_idx" ON "UserPlatinaStockHistory"("changeType");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panVerificationData" ADD CONSTRAINT "panVerificationData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPurchasedServices" ADD CONSTRAINT "UserPurchasedServices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPurchasedServices" ADD CONSTRAINT "UserPurchasedServices_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPurchasedServices" ADD CONSTRAINT "UserPurchasedServices_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "ServicePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "ServicePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "ServicePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAgreement" ADD CONSTRAINT "ServiceAgreement_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAgreement" ADD CONSTRAINT "ServiceAgreement_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplimentaryService" ADD CONSTRAINT "ComplimentaryService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplimentaryService" ADD CONSTRAINT "ComplimentaryService_complimentaryServiceId_fkey" FOREIGN KEY ("complimentaryServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplimentaryService" ADD CONSTRAINT "ComplimentaryService_complimentaryServicePlanId_fkey" FOREIGN KEY ("complimentaryServicePlanId") REFERENCES "ServicePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePlan" ADD CONSTRAINT "ServicePlan_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioReview" ADD CONSTRAINT "PortfolioReview_userPurchasedServiceId_fkey" FOREIGN KEY ("userPurchasedServiceId") REFERENCES "UserPurchasedServices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchAdvisoryStockList" ADD CONSTRAINT "ResearchAdvisoryStockList_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchAdvisoryModelPortfolioStockList" ADD CONSTRAINT "ResearchAdvisoryModelPortfolioStockList_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchAdvisoryMutualFundStockList" ADD CONSTRAINT "ResearchAdvisoryMutualFundStockList_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRiskProfileResponse" ADD CONSTRAINT "UserRiskProfileResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRiskProfileResponse" ADD CONSTRAINT "UserRiskProfileResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "RiskProfileQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRiskProfile" ADD CONSTRAINT "UserRiskProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePlatinaWealth" ADD CONSTRAINT "ServicePlatinaWealth_id_fkey" FOREIGN KEY ("id") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatinaRecommendation" ADD CONSTRAINT "UserPlatinaRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatinaRecommendation" ADD CONSTRAINT "UserPlatinaRecommendation_platinaServiceId_fkey" FOREIGN KEY ("platinaServiceId") REFERENCES "ServicePlatinaWealth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatinaRecommendation" ADD CONSTRAINT "UserPlatinaRecommendation_riskProfileId_fkey" FOREIGN KEY ("riskProfileId") REFERENCES "UserRiskProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatinaStockList" ADD CONSTRAINT "UserPlatinaStockList_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "UserPlatinaRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatinaStockHistory" ADD CONSTRAINT "UserPlatinaStockHistory_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "UserPlatinaRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
