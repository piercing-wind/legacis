"use client";

import React, { useEffect } from "react";
import { getSession, resetAuthSlice } from "@/lib/slices/authSlice";
import { Button } from "../ui/button";
import { SignOut } from "@/actions/session";
import Image from "next/image";
import { Info, Pencil } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import { getFullUserData, setModalOpen } from "@/lib/slices/profile";
import { toast } from "sonner";
import Loading from "../loading";
import { User } from "next-auth";
import { User as FullUser} from "@/prisma/generated/client";

const Profile = ({user, fullUserData}:{user: User, fullUserData: FullUser | null}) => {
   const dispatch = useAppDispatch();

   const signOut = async () => {
     dispatch({ type: 'RESET_APP' });
     await SignOut();
   };

   const handleKycCompleteButton = () => {
   if (user.panVerified === null) {
      dispatch(setModalOpen({open: true, modelType : 'panVerification'}));
      toast.info(
         "After Completing KYC your Name, Date of Birth (DOB), PAN, Address, Account Type Cannot be Changed.",
         {
         duration: 30000,
         }
      );
   } else if (user.emailVerified === null) {
      dispatch(setModalOpen({open: true, modelType :"emailVerification"}));
   } else if (user.phoneVerified === null) {
      dispatch(setModalOpen({open: true, modelType :'phoneVerification'}));
   }
   };

  return (
    <div className="w-full max-w-full mx-auto py-6 md:py-12 px-2 md:px-6 rounded-xl md:rounded-2xl shadowA4 bg-white dark:bg-neutral-900">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col gap-4 md:gap-6 pb-4 md:pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 grow">
              <div className="relative rounded-full border-2 border-neutral-300 dark:border-neutral-600 shrink-0 h-20 w-20 md:h-24 md:w-24 shadow-lg bg-neutral-100">
                <Image
                  src={user?.image || "/profile/user-1.png"}
                  alt="Profile Picture"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="96px"
                />
                <Button
                  variant="ghost"
                  className="absolute -top-3 -right-3 rounded-full !bg-neutral-50/80 shadow"
                  onClick={() => {dispatch(setModalOpen({open: true, modelType : 'avatar'}));}}
                >
                  <Pencil color="#c39ff9" size={20} />
                </Button>
              </div>
              <div>
                <h4 className="!text-lg md:!text-xl font-semibold">{user?.name}</h4>
                <h6 className="!text-sm text-neutral-500">@{user?.username}</h6>
                <h6 className="!text-sm text-neutral-500">Account Type: {user?.userType}</h6>
              </div>
            </div>
            {(user?.panVerified === null || user?.emailVerified === null || user?.phoneVerified === null) && 
               <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
               <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold border border-yellow-300">
                  Verification Pending
               </span>
               <span className="relative group">
                  <Info className="h-4 w-4 text-neutral-400 cursor-pointer" />
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded bg-neutral-900 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                     After completing KYC, you cannot change your Name and PAN address.
                  </span>
               </span>
               </div>
            }
          </div>
          <div className="flex flex-col md:grid md:grid-cols-3 items-stretch gap-2 md:gap-3 py-4 border-t border-b border-neutral-200 dark:border-neutral-700">
            <Button
              variant="outline"
              className="text-xs px-4 rounded-full flex-1"
            >
              Sign Out
            </Button>
            <Button
              variant={"legacis"}
              className="text-xs px-4 rounded-full flex-1"
            >
              Change Password
            </Button>
            {(user?.panVerified === null || user?.emailVerified === null || user?.phoneVerified === null) &&
               <Button
               className="text-xs px-4 rounded-full flex-1"
               onClick={handleKycCompleteButton}
               >
               Complete KYC Now
               </Button>
            }
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-14">
          <div>
            <h6 className="text-xs text-neutral-500 mb-1">Email</h6>
            <div className="flex flex-col text-base md:text-lg font-medium">
              <span>{user?.email}</span>
              {user?.emailVerified === null && (
                <span className="mt-1 w-max px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold border border-red-200">
                  Not Verified
                </span>
              )}
            </div>
          </div>
          <div>
            <h6 className="text-xs text-neutral-500 mb-1">Phone</h6>
            <div className="flex flex-col text-base md:text-lg font-medium">
              <span>+91 {user?.phone}</span>
              {user?.phoneVerified === null && (
                <span className="mt-1 w-max px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold border border-red-200">
                  Not Verified
                </span>
              )}
            </div>
          </div>
          <div>
            <h6 className="text-xs text-neutral-500 mb-1">PAN</h6>
            <div className="flex flex-col text-base md:text-lg font-medium">
              <span>{fullUserData?.pan || "Not provided"}</span>
              {user?.panVerified === null && fullUserData?.pan !== null && (
                <span className="mt-1 w-max px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold border border-red-200">
                  Not Verified
                </span>
              )}
            </div>
          </div>
          {fullUserData?.userType === "BUSINESS" ? (
            <div>
              <h6 className="text-xs text-neutral-500 mb-1">GSTIN</h6>
              <div className="text-base md:text-lg font-medium">
                {fullUserData?.gstin || "Not provided"}
              </div>
            </div>
          ) : (
            <>
              <div>
                <h6 className="text-xs text-neutral-500 mb-1">Date of Birth</h6>
                <div className="text-base md:text-lg font-medium">
                  {fullUserData?.dob ? fullUserData.dob : "Not provided"}
                </div>
              </div>
              <div>
                <h6 className="text-xs text-neutral-500 mb-1">Aadhar Number</h6>
                <div className="text-base md:text-lg font-medium">
                  {fullUserData?.aadharNumber || "Not provided"}
                </div>
              </div>
            </>
          )}
          <div>
            <h6 className="text-xs text-neutral-500 mb-1">Address</h6>
            <div className="text-base md:text-lg font-medium">
              {fullUserData?.address || "Not provided"}
            </div>
          </div>
          <div>
            <h6 className="text-xs text-neutral-500 mb-1">State</h6>
            <div className="text-base md:text-lg font-medium">
              {fullUserData?.state || "Not provided"}
            </div>
          </div>
          <div>
            <h6 className="text-xs text-neutral-500 mb-1">City</h6>
            <div className="text-base md:text-lg font-medium">
              {fullUserData?.city || "Not provided"}
            </div>
          </div>
          <div>
            <h6 className="text-xs text-neutral-500 mb-1">ZIP</h6>
            <div className="text-base md:text-lg font-medium">
              {fullUserData?.zip || "Not provided"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;