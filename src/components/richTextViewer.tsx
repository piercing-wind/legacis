'use client';
import { Agreement } from '@/prisma/generated/client';
import { SerializableAgreement, ServiceAgreement } from '@/types/global';
import { CheckCircle2 } from 'lucide-react';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { useState, useTransition } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { sendOTP, verifyOTP } from '@/actions/optVerification';
import { toast } from 'sonner';

export const QuillHtmlViewer = ({ delta }: { delta: any }) => {
  let html = '';
  try {
    const converter = new QuillDeltaToHtmlConverter(delta.ops, {});
    html = converter.convert();
  } catch {
    html = typeof delta === 'string' ? delta : '';
  }
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
export const AgreementViewer = ({ agreementContent, agreementData }: { agreementContent: SerializableAgreement[] | null , agreementData : ServiceAgreement | null}) => {
   if (!agreementContent || agreementContent.length === 0) {
      return <div className="text-center text-gray-500">No agreement available</div>;
   }
   const [otp, setOTP] = useState<string>(''); 
   const [otpSent, setOTPSent] = useState<boolean>(false);
   const [isPending, startTransition] = useTransition();
   const signatureAgreement = agreementContent.find(
    (agreement) => agreement.signatoryPerson || agreement.companyName
  );

    function sendotp() {
      startTransition(() => {
          sendOTP({identifier : agreementData?.clientPhoneNumber || "", verificationType : 'AGREEMENT_ACCEPTANCE'})
           .then((res) => {
             if (!res.success) throw new Error(res.message);
             setOTPSent(true);
             toast.success(<h6>OTP Sent!</h6>,{
                duration: 10000,
                action: {
                   label: "Close",
                   onClick: () => toast.dismiss(),
                },
                description: `${res.message}`,
             });
          }).catch((error)=> {
             setOTPSent(false);
             toast.error(<h6 style={{color:"red"}}>Failed to send Code!</h6>,{
                duration: 10000,
                action: {
                   label: "Close",
                   onClick: () => toast.dismiss(),
                },
                description: `${(error as Error).message}`,
             });
          });
          
      })
  }

   function verify() {
      if(otp === "" || otp.length < 4) {
         setOTPSent(false);
         toast.error(<h6 style={{color:"red"}}>Please enter the OTP!</h6> )
         return;  
      }
        startTransition(() => {
           verifyOTP({identifier : agreementData?.clientPhoneNumber || "", otp: otp})
            .then(async (res) => {
              if (!res.success) throw new Error(res.message);
              setOTPSent(false);
              toast.success(<h6>OTP Verified!</h6>, {
                 duration: 10000,
                 action: {
                    label: "Close",
                    onClick: () => toast.dismiss(),
                 },
                 description: `${res.message}`,
              });
            }).catch((err) => {
              setOTPSent(false);
              toast.error(<h6 style={{color:"red"}}>Failed to verify OTP!</h6>, {
                duration: 10000,
                action: {
                  label: "Close",
                  onClick: () => toast.dismiss(),
                },
                description: `${(err as Error).message}`,
              });
            })
        })
  
    }




   return (
      <div className="quill-agreement-content text-xs dark:!text-neutral-50 max-w-4xl w-full h-[80vh] overflow-x-hidden overflow-y-auto rounded-2xl lg:px-8 p-4 bg-white dark:bg-neutral-800">
         {agreementContent.map((agreement) => (
            <div key={agreement.id} className="mb-8 border-b pb-4 border-dashed">
               <h2 className="font-semibold text-base mb-2 text-legacisPurple">{agreement.name}</h2>
               <QuillHtmlViewer delta={agreement.content} />
            </div>
         ))}
   {agreementData && (
        <div className="mt-10 p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow border border-purple-200 dark:border-neutral-700">
          <h3 className="font-semibold text-xl mb-4 text-legacisPurple flex items-center gap-2">
            <CheckCircle2 size={20}/>
            Service Agreement Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4">
            {[
              { label: "Client Name", value: agreementData.clientName },
              { label: "Client PAN Number", value: agreementData.clientpanNumber },
              { label: "Client Phone Number", value: agreementData.clientPhoneNumber },
              { label: "Service Name", value: agreementData.serviceName },
              { label: "Subscription Start Date", value: agreementData.subscriptionStartDate },
              { label: "Subscription Frequency", value: agreementData.subscriptionFrequency },
              { label: "Subscription Price", value: <span className='font-urbanist'>{agreementData.subscriptionPrice}</span> },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-1 border-b border-dashed border-gray-200 dark:border-neutral-700 last:border-b-0"
              >
                <span className="text-gray-700 dark:text-gray-300">{item.label}:</span>
                <span className="ml-4 font-medium text-right break-all">{item.value}</span>
              </div>
            ))}
         </div>
        </div>
      )}

      <div className='flex flex-col gap-y-8 md:flex-row items-start justify-between mt-8 p-4 border-t border-dashed'>
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
            <div className=''>
               <span className='!text-sm'>{agreementData?.clientName}</span>
            </div>
            <div className="flex items-center gap-2">
               <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                  className=" min-w-20 w-full max-w-xs border p-1 rounded-lg"
               />
               {otpSent ? (
                  <Button onClick={verify} disabled={isPending} className="!text-sm h-auto">Verify</Button>
               ):(
                  <Button onClick={sendotp} disabled={isPending} className="!text-sm h-auto">Send OTP</Button>
               )}
            </div>
         </div>

      </div>
         <span className='text-[10px] opacity-50 mt-4'>
           * Agreements are signed electronically using OTP verification. Please ensure you have access to the registered phone number to receive the OTP.
         </span>
      </div>
   );
};