-- CreateTable
CREATE TABLE "TransactionAgreement" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,

    CONSTRAINT "TransactionAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransactionAgreement_transactionId_idx" ON "TransactionAgreement"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionAgreement_agreementId_idx" ON "TransactionAgreement"("agreementId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionAgreement_transactionId_agreementId_key" ON "TransactionAgreement"("transactionId", "agreementId");

-- AddForeignKey
ALTER TABLE "TransactionAgreement" ADD CONSTRAINT "TransactionAgreement_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionAgreement" ADD CONSTRAINT "TransactionAgreement_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
