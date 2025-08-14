"use client";
import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuillHtmlViewer } from "./richTextViewer";
import { Check, CheckCircle2 } from "lucide-react";
import { AgreementSummary } from "@/types/global";
import { Agreement, Service, ServicePlan, Transaction } from "@/prisma/generated/client";
import { formatDateWithTime } from "@/lib/utils";
import { AgreementPdfDownload } from "./agreementdownloader";
import { Button } from "./ui/button";

type TransactionWithDetails = Transaction & {
  transactionAgreements: {
    agreement: Agreement;
  }[];
};

export const AgreementDialog: React.FC<{
  btnText?: string;
  txn: TransactionWithDetails;
}> = ({ btnText = "View Agreement", txn }) => {
   const dialogContentRef = useRef<HTMLDivElement>(null);

   const agreements = txn.transactionAgreements ?? [];
   // Find signature agreement
   const signatureAgreement = agreements
      .map(ta => ta.agreement)
      .find(agreement => agreement.signatoryPerson || agreement.companyName);

  return (
    <Dialog>
      <DialogTrigger asChild>
         <Button variant={'secondary'} size={'sm'} className="w-full px-4">
            {btnText}
         </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] text-sm flex flex-col">
        {/* Header with download button */}
        <div className="flex justify-between items-center px-2 sm:px-4 w-full">
          <DialogHeader className="sm:flex-1">
            <DialogTitle className="w-auto">Agreement </DialogTitle>
          </DialogHeader>
          <AgreementPdfDownload
            contentRef={dialogContentRef} 
            filename={txn.orderId || "agreement"}
            agreementData={txn.transactionAgreements.map(ta => ta.agreement)}
            agreementSummary={txn.agreementSummary as AgreementSummary}
            agreementAcceptedAt={txn.agreementAcceptedAt}
          />
        </div>
        
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Main content that will be captured for PDF */}
          <div ref={dialogContentRef}>
          
          {txn.transactionAgreements.length === 0 ? (
            <div className="text-gray-500">No agreements accepted for this transaction.</div>
          ) : (
            txn.transactionAgreements.map((ta) => {
              let delta: any = ta.agreement.content;
              if (typeof delta === "string") {
                try {
                  delta = JSON.parse(delta);
                } catch {
                  delta = { ops: [{ insert: ta.agreement.content }] };
                }
              }
              return (
                <div key={ta.agreement.id} className="mb-8 border-b pb-4 border-dashed text-xs sm:text-sm">
                  <h2 className="font-semibold text-base mb-2 text-legacisPurple dark:text-legacisGreen">
                    {ta.agreement.name}
                  </h2>
                  <QuillHtmlViewer delta={delta} />
                </div>
              );
            })
          )}
          {/* Show Service Agreement Details if present for this transaction */}
          {typeof txn.agreementSummary === "object" &&
            txn.agreementSummary !== null && (
              (() => {
                const summary = txn.agreementSummary as AgreementSummary;
                return (
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow border border-purple-200 dark:border-neutral-700">
                    <h3 className="font-semibold text-base sm:text-xl mb-4 text-legacisPurple dark:text-legacisGreen flex items-center gap-2">
                      <CheckCircle2 size={16}/>
                      Service Agreement Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4">
                      {[
                        { label: "Client Name", value: summary.clientName },
                        { label: "Client Phone Number", value: summary.clientPhoneNumber },
                        { label: "Client PAN Number", value: summary.clientpanNumber },
                        { label: "Client Aadhaar Number", value: summary.aadhaarNumber },
                        { label: "Service Name", value: summary.serviceName },
                        ...(summary.complimentaryServicesNames
                        ? [{ label: "Complimentary Services", value: summary.complimentaryServicesNames }]
                        : []),
                        { label: "Subscription Start Date", value: summary.subscriptionStartDate },
                        { label: "Subscription Frequency", value: summary.subscriptionFrequency },
                        { label: "Subscription Price", value: <span className='font-urbanist'>{summary.subscriptionPrice}</span> },
                        { label: "Agreement Accepted On", value: <span className='font-urbanist'>{formatDateWithTime(txn.agreementAcceptedAt!)}</span> },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-1 border-b border-dashed border-gray-200 dark:border-neutral-700 last:border-b-0"
                        >
                          <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-base">{item.label}:</span>
                          <span className="ml-4 font-medium text-right break-all text-xs sm:text-base">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            )}
         </div>
            
          <div className='flex flex-col gap-y-8 md:flex-row items-start md:items-end justify-between mt-8 p-4 border-t border-dashed'>
            {signatureAgreement && (signatureAgreement.signatoryPerson || signatureAgreement.companyName) && (
              <div className="flex flex-col items-start">
                {signatureAgreement.signatoryPerson && (
                  <span className='!text-sm'>{signatureAgreement.signatoryPerson}</span>
                )}
                {signatureAgreement.companyName && (
                  <span className="!text-base font-medium"> {signatureAgreement.companyName} </span>
                )}
              </div>
            )}
            <div>
              <div className='flex flex-col items-end'>
                <span className='!text-sm flex items-center gap-x-2'>
                  <Check size={16} className="text-green-600" /> 
                  Agreement Accepted
                </span>
                <span className='!text-sm font-semibold'>
                  {typeof txn.agreementSummary === "object" && txn.agreementSummary !== null
                    ? (txn.agreementSummary as AgreementSummary).clientName
                    : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogDescription className="text-xs ">
          This agreement was accepted on {formatDateWithTime(txn.agreementAcceptedAt!)} and digitally signed using Aadhaar OTP verification (UIDAI).
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
