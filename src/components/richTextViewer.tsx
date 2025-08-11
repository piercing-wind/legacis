'use client';
import { CheckCircle2, Link } from 'lucide-react';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { use, useEffect, useRef, useState, useTransition } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { sendOTP, verifyOTP } from '@/actions/optVerification';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { OrderEntity } from 'cashfree-pg';
import { load } from "@cashfreepayments/cashfree-js";
import Loading from './loading';
import { setModalOpen } from '@/lib/slices/profile';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripColorsFromDelta(delta: any) {
if (!delta || !Array.isArray(delta.ops)) return delta;
return {
  ...delta,
  ops: delta.ops.map((op: any) => {
    if (op.attributes && (op.attributes.color || op.attributes.background)) {
      const { color, background, ...rest } = op.attributes;
      return { ...op, attributes: { ...rest } };
    }
    return op;
  }),
};
}

export const QuillHtmlViewer = ({ delta, className }: { delta: any, className?: string }) => {
   const cleanedDelta = stripColorsFromDelta(delta);
   let html = '';
  try {
    const converter = new QuillDeltaToHtmlConverter(cleanedDelta.ops, {});
    html = converter.convert();

    // Add id to headings (h1, h2, h3, ...)
    html = html.replace(/<(h[1-6])>(.*?)<\/\1>/g, (match, tag, content) => {
      // Remove HTML tags from content for slug
      const plain = content.replace(/<[^>]+>/g, '');
      const id = slugify(plain);
      // Add anchor link icon (optional)
     return `<${tag} class="heading-anchor" id="${id}">${content}</${tag}>`;
    });
  } catch {
    html = typeof cleanedDelta === 'string' ? cleanedDelta : '';
  }
  return (
    <div
      className={cn(
        className,
        "w-full [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:max-w-5xl [&_table]:min-w-xs [&_table]:rounded-lg [&_table]:p-2 [&_table]:mx-auto [&_table]:text-nowrap [&_table]:sm:text-wrap [&_table]:border  [&_td]:p-2 [&_th]:p-2 [&_tr]:border-b [&_tr]:opacity-80 [&_table]:text-sm [&_table]:font-normal",
        "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-gray-900 dark:[&_h1]:text-gray-100 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:text-gray-900 dark:[&_h2]:text-gray-100 [&_h3]:text-base [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:text-gray-900 dark:[&_h3]:text-gray-100 [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-gray-700 dark:[&_p]:text-gray-300 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3 [&_li]:mb-1 [&_li]:text-gray-700 dark:[&_li]:text-gray-300 [&_strong]:font-semibold [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 dark:[&_blockquote]:text-gray-400"
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};


type CreateOrderResponse = OrderEntity & { error?: string };

type CashfreeInstance = {
  checkout: (options: { paymentSessionId: string; redirectTarget?: string }) => Promise<any>;
};


export const AgreementViewer = () => {
   const {service, agreement, agreementSummary, coupon} = useAppSelector((state) => state.checkout);
   const cashfreeRef = useRef<CashfreeInstance | null>(null);
   const agreementContent = agreement;
   const plan = service.selectedPlan;
   const serviceId = service.serviceId;
   const router = useRouter();
   const dispatch = useAppDispatch();
   const [otp, setOTP] = useState<string>(''); 
   const [otpSent, setOTPSent] = useState<boolean>(false);
   const [isPending, startTransition] = useTransition();
   const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);
   const [showAgreementModal, setShowAgreementModal] = useState(true);
   const signatureAgreement = agreementContent?.find(
    (agreement) => agreement.signatoryPerson || agreement.companyName
   );
   
   useEffect(() => {
    load({ mode: "sandbox" }).then((cf) => {
      cashfreeRef.current = cf;
    });
   }, []);
   if (!agreementContent || agreementContent.length === 0) {
      return <div className="text-center">No agreement available</div>;
   }

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
         await handlePayment(data.payment_session_id, data.order_id);
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
         console.log("Error verifying OTP:", error);
      }
   
   }

   const handleCreateOrder = async () : Promise<CreateOrderResponse>=>{
      const agreementNames = agreementContent.map(a => a.name).join(", ");
      const agreementIds = agreementContent.map(a => a.id);
      const agreementHashes = agreementContent.map(a => a.hash); // Hash already stored in db when creating the agreement

      const agreementSummaryWithName = {
        ...agreementSummary,
        agreementNames, 
        agreementIds,
        agreementHashes,
      };
      const orderRes = await fetch('/api/payment/create-order',{
       method: 'POST',
       headers: {
          'Content-Type': 'application/json',
       },
       body: JSON.stringify({
          serviceId,
          selectedPlan : plan,
          coupon : coupon || null,
          agreementSummary : agreementSummaryWithName,
       })
    })
    if (!orderRes.ok) throw new Error(`Failed to create order: ${orderRes.statusText}`);
     return await orderRes.json() as CreateOrderResponse;
    }

   const handlePayment = async (paymentSessionId: string, orderId: string | undefined) => {
      if (cashfreeRef.current) {

         let checkoutOptions = {
           paymentSessionId,
           redirectTarget: "_modal",
           onclose: () => {
             dispatch(setModalOpen({ open: false }));
             toast.info("Payment window closed.");
           }
         };
            
         cashfreeRef.current.checkout(checkoutOptions).then((result: any) => {
           if (result.error) {
             dispatch(setModalOpen({open : false}));
             toast.error(`Transaction was not completed. ${result.error.message} or contact support if the issue persists.`,{
               duration: 10000,
             });
           }
           if (result.redirect) {
             toast.info("Payment will be redirected.");
           }
           if (result.paymentDetails) {
             dispatch(setModalOpen({open : false}));
             router.push('/thank-you?orderId=' + orderId);
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
            <div className="quill-content text-xs dark:!text-neutral-50 max-w-4xl w-full h-[80vh] overflow-x-hidden overflow-y-auto rounded-2xl lg:px-8 p-4 bg-white dark:bg-neutral-800">
               {agreementContent.map((agreement) => {
                  
                  let delta: any = agreement.content;
                  if (typeof delta === "string") {
                     try {
                        delta = JSON.parse(delta);
                     } catch {
                        delta = { ops: [{ insert: agreement.content }] };
                     }
                  }
   
                  return(
                     <div key={agreement.id} className="mb-8 border-b pb-4 border-dashed">
                        <h2 className="font-semibold text-base mb-2 text-legacisPurple dark:text-legacisGreen">{agreement.name}</h2>
                        <QuillHtmlViewer delta={delta} />
                     </div>
                  )
               })}
            {agreementSummary && (
               <div className="mt-10 p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow border border-purple-200 dark:border-neutral-700">
                  <h3 className="font-semibold text-xl mb-4 text-legacisPurple dark:text-legacisGreen flex items-center gap-2">
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
                        <Button onClick={sendotp} disabled={isPending} size={'sm'} className="!text-sm">Send OTP</Button>
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