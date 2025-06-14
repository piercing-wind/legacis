'use client';
import { CheckCircle2 } from 'lucide-react';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { sendOTP, verifyOTP } from '@/actions/optVerification';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { OrderEntity } from 'cashfree-pg';
import { load } from "@cashfreepayments/cashfree-js";
import Loading from './loading';
import { setModalOpen } from '@/lib/slices/profile';

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


type CreateOrderResponse = OrderEntity & { error?: string };

type CashfreeInstance = {
  checkout: (options: { paymentSessionId: string; redirectTarget?: string }) => Promise<any>;
};


export const AgreementViewer = () => {
   const {agreementSummary, agreement, service, coupon} = useAppSelector((state) => state.checkout);
   const cashfreeRef = useRef<CashfreeInstance | null>(null);
   const agreementContent = agreement;
   const tenure = service.tenureDiscount;
   const serviceId = service.serviceId;

   if (!agreementContent || agreementContent.length === 0) {
      return <div className="text-center">No agreement available</div>;
   }
   const dispatch = useAppDispatch();

   const [otp, setOTP] = useState<string>(''); 
   const [otpSent, setOTPSent] = useState<boolean>(false);
   const [isPending, startTransition] = useTransition();
   const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);
   const [showAgreementModal, setShowAgreementModal] = useState(true);

   const signatureAgreement = agreementContent.find(
    (agreement) => agreement.signatoryPerson || agreement.companyName
   );

   useEffect(() => {
    load({ mode: "sandbox" }).then((cf) => {
      cashfreeRef.current = cf;
    });
   }, []);

   function sendotp() {
      startTransition(() => {
          sendOTP({identifier : agreementSummary?.clientPhoneNumber || "", verificationType : 'AGREEMENT_ACCEPTANCE'})
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

  async function verify() {
      if(otp === "" || otp.length < 4) {
         setOTPSent(false);
         toast.error(<h6 style={{color:"red"}}>Please enter the OTP!</h6> )
         return;  
      }
        setOTPSent(false);
        setShowLoadingModal(true);
        setShowAgreementModal(false);
        try{
         const res = await verifyOTP({identifier : agreementSummary?.clientPhoneNumber || "", otp: otp});
         if (!res.success) throw new Error(res.message);
         toast.success(<h6>OTP Verified!</h6>, {
            duration: 10000,
            action: {
               label: "Close",
               onClick: () => toast.dismiss(),
            },
            description: `${res.message}`,
         });
         const data = await handleCreateOrder();
         if (!data.payment_session_id) throw new Error("Payment session ID not received from server.");
         setShowLoadingModal(false);
         await handlePayment(data.payment_session_id);
         console.log("OTP verified successfully, proceeding to create order.");

        }catch(error){
         setShowLoadingModal(false);
         setShowAgreementModal(true);
         toast.error(<h6 style={{color:"red"}}>Failed to verify OTP!</h6>, {
            duration: 10000,
            action: {
               label: "Close",
               onClick: () => toast.dismiss(),
            },
            description: `${(error as Error).message}`,
         });
         console.error("Error verifying OTP:", error);
        }
  
   }

   const handleCreateOrder = async () : Promise<CreateOrderResponse>=>{
      const agreementNames = agreementContent.map(a => a.name).join(", ");
      const agreementIds = agreementContent.map(a => a.id);
      const agreementHashs = agreementContent.map(a => a.hash);

      const agreementSummaryWithName = {
        ...agreementSummary,
        agreementNames, 
        agreementIds,
        agreementHashs,
      };
      const orderRes = await fetch('/api/payment/create-order',{
       method: 'POST',
       headers: {
          'Content-Type': 'application/json',
       },
       body: JSON.stringify({
          serviceId,
          tenureDays: tenure.days,
          tenureDicount : tenure.discount,
          coupon : coupon || null,
          agreementSummary : agreementSummaryWithName,
       })
    })
    if (!orderRes.ok) throw new Error(`Failed to create order: ${orderRes.statusText}`);
    return await orderRes.json() as CreateOrderResponse;
   }

   const handlePayment = async (paymentSessionId: string) => {
      if (cashfreeRef.current) {

         let checkoutOptions = {
           paymentSessionId,
           redirectTarget: "_modal",
         };
            
         cashfreeRef.current.checkout(checkoutOptions).then((result: any) => {
           if (result.error) {
             toast.error(`Transaction was not completed. ${result.error.message} or contact support if the issue persists.`,{
               duration: 10000,
             });
           }
           if (result.redirect) {
             toast.info("Payment will be redirected.");
           }
           if (result.paymentDetails) {
             dispatch(setModalOpen({open : false}));
             toast.success("Payment completed: " + result.paymentDetails.paymentMessage);
           }
         });
      } else {
        toast.error("Cashfree SDK not loaded.");
      } 
   }

   return (
      <>
        {showLoadingModal && (
           <div className="fixed inset-0 flex items-center justify-center backdrop-blur-2xl z-50">
             <Loading message="Agreement Accepted! Please wait we are creating your order."/>
           </div>
         )}
         {showAgreementModal && (
            <div className="quill-agreement-content text-xs dark:!text-neutral-50 max-w-4xl w-full h-[80vh] overflow-x-hidden overflow-y-auto rounded-2xl lg:px-8 p-4 bg-white dark:bg-neutral-800">
               {agreementContent.map((agreement) => (
                  <div key={agreement.id} className="mb-8 border-b pb-4 border-dashed">
                     <h2 className="font-semibold text-base mb-2 text-legacisPurple">{agreement.name}</h2>
                     <QuillHtmlViewer delta={agreement.content} />
                  </div>
               ))}
            {agreementSummary && (
            <div className="mt-10 p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow border border-purple-200 dark:border-neutral-700">
               <h3 className="font-semibold text-xl mb-4 text-legacisPurple flex items-center gap-2">
                  <CheckCircle2 size={20}/>
                  Service Agreement Details
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4">
                  {[
                  { label: "Client Name", value: agreementSummary.clientName },
                  { label: "Client PAN Number", value: agreementSummary.clientpanNumber },
                  { label: "Client Phone Number", value: agreementSummary.clientPhoneNumber },
                  { label: "Service Name", value: agreementSummary.serviceName },
                  { label: "Subscription Start Date", value: agreementSummary.subscriptionStartDate },
                  { label: "Subscription Frequency", value: agreementSummary.subscriptionFrequency },
                  { label: "Subscription Price", value: <span className='font-urbanist'>{agreementSummary.subscriptionPrice}</span> },
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
                     <span className='!text-sm'>{agreementSummary?.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOTP(e.target.value)}
                        className=" min-w-20 w-full h-auto max-w-xs border p-1 rounded-lg"
                     />
                     {otpSent ? (
                       <Button onClick={verify} disabled={isPending || showLoadingModal} className="!text-sm h-auto">
                         {isPending ? 'verifying' : 'Verify'}
                       </Button>
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
         )}
      </>
   );
};