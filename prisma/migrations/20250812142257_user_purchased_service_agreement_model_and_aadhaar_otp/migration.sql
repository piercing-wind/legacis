-- CreateTable
CREATE TABLE "AadhaarOtp" (
    "id" TEXT NOT NULL,
    "aadharNumber" TEXT NOT NULL,
    "ref_id" TEXT NOT NULL,
    "otpStatus" TEXT NOT NULL,
    "generatedOTPResponse" JSONB,
    "verifyOTPResponse" JSONB,
    "userPurchasedServiceId" TEXT,

    CONSTRAINT "AadhaarOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPurchasedServiceAgreement" (
    "id" TEXT NOT NULL,
    "userPurchasedServiceId" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,

    CONSTRAINT "UserPurchasedServiceAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AadhaarOtp_userPurchasedServiceId_key" ON "AadhaarOtp"("userPurchasedServiceId");

-- CreateIndex
CREATE INDEX "UserPurchasedServiceAgreement_userPurchasedServiceId_idx" ON "UserPurchasedServiceAgreement"("userPurchasedServiceId");

-- CreateIndex
CREATE INDEX "UserPurchasedServiceAgreement_agreementId_idx" ON "UserPurchasedServiceAgreement"("agreementId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPurchasedServiceAgreement_userPurchasedServiceId_agreem_key" ON "UserPurchasedServiceAgreement"("userPurchasedServiceId", "agreementId");

-- AddForeignKey
ALTER TABLE "AadhaarOtp" ADD CONSTRAINT "AadhaarOtp_userPurchasedServiceId_fkey" FOREIGN KEY ("userPurchasedServiceId") REFERENCES "UserPurchasedServices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPurchasedServiceAgreement" ADD CONSTRAINT "UserPurchasedServiceAgreement_userPurchasedServiceId_fkey" FOREIGN KEY ("userPurchasedServiceId") REFERENCES "UserPurchasedServices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPurchasedServiceAgreement" ADD CONSTRAINT "UserPurchasedServiceAgreement_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
