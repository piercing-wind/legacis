'use client'
import React, { useMemo } from "react";
import AvatarChange from "./avatar";
import { Button } from "../ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setModalOpen } from "@/lib/slices/profile";
import { X } from "lucide-react";
import KYCForm from "./kycForm";
import EmailVerificationForm from "./emailVerificationForm";
import OTPVerificationForm from "../shared/otpVerificationForm";
import PhoneVerificationForm from "./phoneVerificationForm";
import EmailUpdateForm from "./emailUpdateForm";
import ConsentForm from "./consent";
import { AgreementViewer } from "../richTextViewer";

const Modal = () => {
   const isOpen = useAppSelector((state) => state.profile.modalOpen);
   const model = useAppSelector((state) => state.profile.modalType);
   const {agreement, agreementData } = useAppSelector((state) => state.profile);
   
   const dispatch = useAppDispatch();


   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && model === 'avatar') {
      dispatch(setModalOpen({open : false}));
    }
   };

   const renderModel = useMemo(() => {
     switch (model) {
       case 'avatar':
         return <AvatarChange />;
       case 'panVerification':
         return <KYCForm />;
       case 'emailVerification':
         return <EmailVerificationForm />;
       case 'emailUpdate':
         return <EmailUpdateForm />;
       case 'phoneVerification':
         return <PhoneVerificationForm />;
       case 'phoneUpdate':
       case 'otpVerification':
         return <OTPVerificationForm />;
       case 'consent':
         return <ConsentForm/>
       case 'agreement':
         return <AgreementViewer agreementContent={agreement} agreementData={agreementData} />;

       default:
         return null;
     }
   }, [model]);

   if (!isOpen) return null;

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 flex flex-col w-full h-screen overflow-y-auto overflow-x-clip items-center justify-center backdrop-blur-sm z-50"
      aria-modal="true"
      role="dialog"
    >
        <Button variant={'ghost'} className="absolute top-4 right-4 z-50 rounded-full" onClick={()=>dispatch(setModalOpen({open: false}))}><X size={24}/></Button>
      {renderModel}
    </div>
  );
};

export default Modal;