'use client';
import { Agreement, Coupon, Service } from "@/prisma/generated/client";
import { OrderEntity } from "cashfree-pg";
import { useEffect, useRef, useState } from "react";
import { ClipLoader } from 'react-spinners';
import { DrawerClose } from "../ui/drawer";
import { User } from "next-auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setModalOpen } from "@/lib/slices/profile";
import { TenureDiscount } from "@/types/service";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Line } from "../icon";
import { findCouponByCode } from "@/lib/data/coupon";
import { Input } from "../ui/input";
import { SerializableAgreement, ServiceAgreement } from "@/types/global";
import { formatHumanDate } from "@/lib/utils";
import { selectTenure, setAgreement, setAgreementSummary, setCoupon } from "@/lib/slices/checkoutSlice";
import { useSession } from "next-auth/react";

export const CheckoutForm=({ service, agreement} :{service: Service  | null, agreement: Agreement[] | null})=>{
   const drawerCloseRef = useRef<HTMLButtonElement>(null);
   const [loading, setLoading] = useState(false);
   const [couponCode, setCouponCode] = useState("");
   const [couponLoading, setCouponLoading] = useState(false);
   const {data} = useSession()
   const user = data?.user as User;

   const selectedTenure = useAppSelector((state) => state.checkout.service.tenureDiscount);
   const appliedCoupon = useAppSelector((state) => state.checkout.coupon);
   const dispatch = useAppDispatch();

   useEffect(() => {
      setCouponCode("");
   },[selectedTenure]);

   const months = Math.round(selectedTenure.days / 30)
   const tenureDiscount = selectedTenure.discount;

   const basePrice = Number(service?.price) * months ; 
   
   const subtotal = Math.round(basePrice * (1 - tenureDiscount / 100));

   const taxPercent = service?.taxPercent ?? 0;

   const couponDiscount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.percentOff / 100)) : 0;

   const taxableAmount = subtotal - couponDiscount;

   const taxAmount = Math.round(taxableAmount * (taxPercent / 100));

   const total = taxableAmount + taxAmount;

   const agreementSummary : ServiceAgreement = {
      clientName: user.name || user.email || "Unknown User",
      clientPhoneNumber: user.phone || "Unknown Phone",
      clientpanNumber: user?.pan || "Unknown PAN",
      serviceName: service?.name || "Unknown Service",
      subscriptionStartDate: formatHumanDate(new Date()),
      subscriptionFrequency: `${months} ${months === 1 ? 'Month' : 'Months'}`,
      subscriptionPrice: String(total),
   }

   const handlePlanSelect = async () => {
         try {
            const serviceId = service?.id;
            drawerCloseRef.current?.click();

            if (user.panVerified === null) {
               dispatch(setModalOpen({open : true, modelType :'panVerification'}));
               toast.info(
                  "After Completing KYC your Name, Date of Birth (DOB), PAN, Address, Account Type Cannot be Changed.",
                  {
                  duration: 30000,
                  }
               );
               return;
            } else if (user.emailVerified === null) {
               dispatch(setModalOpen({ open : true, modelType: "emailVerification"}));
               return;
            } else if (user.phoneVerified === null) {
               dispatch(setModalOpen({ open : true, modelType: 'phoneVerification'}));
               return;
            }
   
            if(!serviceId) throw new Error("Service ID is required to select a plan.");
   
            const serializableAgreement: SerializableAgreement[] = (agreement ?? []).map(a => ({
              ...a,
              createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
              updatedAt: a.updatedAt instanceof Date ? a.updatedAt.toISOString() : a.updatedAt,
            }));
            
            dispatch(selectTenure({...selectedTenure, serviceId}));
            dispatch(setAgreement(serializableAgreement ?? null));
            dispatch(setAgreementSummary(agreementSummary));
            dispatch(setModalOpen({open : true, modelType : 'agreement'}));

         } catch (error) {
            setLoading(false);
            toast.error(`Failed to select plan. ${(error as Error).message}`);
         } finally {
            setLoading(false);
         }
   
      }
   
   const handleApplyCoupon = async () => {
      try{
         setCouponLoading(true);
         const coupon = await findCouponByCode({code : couponCode, serviceId : service?.id || "",  planDays : selectedTenure.days });
         
         if(!coupon) throw new Error("Invalid or expired coupon code.");

         if(taxableAmount < (coupon.minAmount ?? 0)) throw new Error(`This coupon can only be applied on orders above ₹${coupon.minAmount?.toLocaleString() || 0}.`);
         if(coupon.maxAmount != null && taxableAmount > coupon.maxAmount) throw new Error(`Coupon can only be applied on orders below ₹${coupon.maxAmount.toLocaleString()}.`);
         const serializableCoupon = {
           ...coupon,
           expiryDate: coupon.expiryDate instanceof Date ? coupon.expiryDate.toISOString() : coupon.expiryDate,
           createdAt: coupon.createdAt instanceof Date ? coupon.createdAt.toISOString() : coupon.createdAt,
           updatedAt: coupon.updatedAt instanceof Date ? coupon.updatedAt.toISOString() : coupon.updatedAt,
         };
         dispatch(setCoupon(serializableCoupon));     
         toast.success(` Coupon applied successfully! You saved ${coupon.percentOff}% on your purchase.`);
      }catch(error){
        toast.error(`Failed to apply coupon. ${(error as Error).message}`);
      }finally {
        setCouponLoading(false);
      }
  }
   return (
      <div className="w-full max-w-2xl h-full border dark:bg-neutral-800 rounded-2xl p-4 items-center justify-center">
       <h4 className="!text-lg !font-medium mb-4">Checkout - {service?.name}</h4>
         <div className="mb-4">
           <div className="flex justify-between">
             <p>Plan Duration</p>
             <span className=" font-normal">{months} {months === 1 ? 'Month' : 'Months'}</span>
           </div>
           <div className="flex justify-between">
             <p>Price</p>
             <span className="font-urbanist">₹{basePrice.toLocaleString()}</span>
           </div>
           <div className="flex justify-between">
             <p>Discount {tenureDiscount}%</p>
             <span className="font-urbanist text-green-500">- ₹{(basePrice - subtotal).toLocaleString()}</span>
           </div>
           <div className="flex justify-between mt-2 pt-1 border-t">
             <p>SubTotal</p>
             <span className="font-urbanist">₹{(subtotal).toLocaleString()}</span>
           </div>

            { appliedCoupon &&
              <div className="flex justify-between">
                <p>Coupon {appliedCoupon.percentOff}%</p>
                <span className="font-urbanist text-green-500">
                  - ₹{couponDiscount.toLocaleString()} 
                </span>
               </div>
            }
            { appliedCoupon &&
              <div className="flex justify-between border-t mt-1 pt-1">
                <p>&nbsp;</p>
                <span className="font-urbanist">
                  ₹{(subtotal - couponDiscount).toLocaleString()} 
                </span>
               </div>
            }
           <div className="flex justify-between mt-1">
             <span>Tax ({taxPercent}%)</span>
             <span className="font-urbanist">₹{taxAmount.toLocaleString()}</span>
           </div>
           <div className="border-t my-2"></div>
           <div className="flex justify-between font-bold text-lg">
             <span>Total</span>
             <span className="font-urbanist">₹{total.toLocaleString()}</span>
           </div>
      </div>
      <div className="mb-4 flex gap-2">
         <Input
           type="text"
           className="border rounded px-2 py-1 flex-1 h-auto"
           placeholder="Coupon code"
           value={couponCode}
           onChange={e => setCouponCode(e.target.value)}
           disabled={couponLoading}
         />
         <Button
            onClick={handleApplyCoupon}
            disabled={couponLoading || !couponCode}
         >
          {couponLoading ? "Applying..." : "Apply"}
         </Button>
      </div>
      <Button
         className="w-full mt-2 uppercase rounded-full h-12"
         onClick={() => handlePlanSelect()}
         disabled={loading || !service}
         variant={'legacis'}
      >
         Subscribe Now 
      </Button>

         <DrawerClose ref={drawerCloseRef}/>
      </div>
   );
}