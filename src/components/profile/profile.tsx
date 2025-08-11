"use client";

import React, { useEffect, useState, useTransition } from "react";
import { getSession, resetAuthSlice } from "@/lib/slices/authSlice";
import { Button } from "../ui/button";
import { SignOut } from "@/actions/session";
import Image from "next/image";
import { Info, Pencil, PenIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setModalOpen } from "@/lib/slices/profile";
import { toast } from "sonner";
import { User } from "next-auth";
import { User as FullUser, UserRiskProfile} from "@/prisma/generated/client";
import UserRiskProfileQuestions from "../services/userRiskProfileForm";
import { Badge } from "../ui/badge";
import { resetGlobalState } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { updateUserName } from "@/actions/profile";
import { useSession } from "next-auth/react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const usernameSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long").max(40, "Username cannot exceed 40 characters "),
});

const Profile = ({user, fullUserData, riskProfile}:{user: User, fullUserData: FullUser | null, riskProfile : UserRiskProfile | null}) => {
   const dispatch = useAppDispatch();
   const [isPending, startTransition] = useTransition();
   const [dialogOpen, setDialogOpen] = useState(false);
   const { update, data } = useSession();
   const router = useRouter();

   const form = useForm<z.infer<typeof usernameSchema>>({
     resolver: zodResolver(usernameSchema),
     defaultValues: {
       username: user?.username || "",
     },
   });

   const signOut = async () => {
      resetGlobalState(dispatch);
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

   const handleChangePassword = () => {
      dispatch(setModalOpen({open: true, modelType : 'changePassword'}));
   };

   const handleUsernameChange = async ( values : z.infer<typeof usernameSchema>) => {
      try {
         const newUsername = values.username;
         if(user.username === newUsername) {
            toast.message("Username is already same!")
            setDialogOpen(false)   
            return
         }
         startTransition(() => {
            updateUserName(user.id, newUsername)
            .then((res) => {
               if (!res.success) throw new Error(res.message);
               toast.success(<h6>Username Changed Successfully!</h6>,{
                  duration: 10000,
                  action: {   
                     label: "Close",
                     onClick: () => toast.dismiss(),
                  },
               });
               user.username = newUsername;
               update({
                  ...data,
                  user: {
                     ...data?.user,
                     username: newUsername,
                  }
               });
               setDialogOpen(false)   
            })
            .catch((error) => {
               toast.error(<h6 style={{color:"red"}}>Failed to change username!</h6>,{
                  duration: 10000,
                  action: {
                     label: "Close",
                     onClick: () => toast.dismiss(),
                  },
                  description: `${(error as Error).message}`,
               });
            })
         });
       
      } catch (error) {
         toast.error("Failed to change username. Please try again later.");
      }
   }


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
                  className="rounded-full overflow-clip"
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
               
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild className="hover:cursor-pointer"><h6 className="!text-sm text-neutral-500 flex items-center gap-4">@{user?.username} <PenIcon size={16}/></h6></DialogTrigger>
                     <DialogContent className="max-w-lg">
                        <DialogHeader>
                           <DialogTitle>Change Username</DialogTitle>
                           <DialogDescription>
                              Current username: <span className="font-semibold">@{user?.username}</span>
                              <br />
                              <br />
                              Please enter a new username below. Usernames must be unique and can only contain alphanumeric characters, underscores, and hyphens.
                           </DialogDescription>
                           <Form {...form}>
                              <form onSubmit={form.handleSubmit(handleUsernameChange)} className="z-10 my-8">
                                 <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                    <FormItem className="mb-4">
                                       <FormLabel>Username</FormLabel>
                                       <FormControl>
                                          <Input placeholder="" {...field} />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                    )}
                                 />
                                 <Button disabled={isPending} type="submit" variant={'secondary'} className="w-full">Change Username</Button>
                              </form>
                           </Form>
                        </DialogHeader>
                  </DialogContent>
               </Dialog>
                <h6 className="!text-sm text-neutral-500">Account Type: {user?.userType}</h6>
              </div>
            </div>
            {(user?.panVerified === null || user?.emailVerified === null || user?.phoneVerified === null) && 
               <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-2 md:mt-0">
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
            <div className="flex flex-col md:flex-row md:border md:p-4 rounded-xl gap-8">
               {riskProfile && riskProfile?.riskPercentage !== null && riskProfile?.riskLevel &&                
                  <div className="flex flex-col md:flex-row h-full gap-8 items-start w-full ">
                     <p className="text-sm text-nowrap gap-4 font-medium flex md:flex-col text-center ">
                        Score <span className="font-semibold">{riskProfile?.riskPercentage} %</span>
                     </p>
                     <p className="text-sm text-nowrap gap-4 font-medium flex md:flex-col text-center ">
                        Risk Level: <Badge variant={'secondary'} className="font-semibold w-full h-10 px-6 md:px-4 py-2">{riskProfile?.riskLevel}</Badge >
                     </p>
                  </div>
               }
               <div className="flex flex-col gap-4">
                  <p className="text-sm font-medium ">Check Your Risk Profile Now</p>
                  <UserRiskProfileQuestions className="px-4 md:px-8 py-2 h-12 border-legacisPurple uppercase rounded-full" />
               </div>
            </div>

          </div>


          <div className="flex flex-col md:grid md:grid-cols-3 items-stretch gap-4 md:gap-3 py-4 border-t border-b border-neutral-200 dark:border-neutral-700">
            <Button
              onClick={signOut}
              variant="outline"
              className="text-xs px-4 rounded-full w-full h-12"
            >
              Sign Out
            </Button>
            {fullUserData?.password ? (
               <Button
               onClick={handleChangePassword}
               variant={"legacis"}
               className="text-xs px-4 rounded-full w-full h-12"
               >
                 Change Password
               </Button>
            ):(
             <Button
               variant={'outline'}
               className="text-xs px-4 rounded-full w-full h-12"
               >
                <Image src="./Google.svg" alt="Google Logo" width={16} height={16} className="inline-block mr-1" />
                Connected With Google
               </Button>
            )}
            {(user?.panVerified === null || user?.emailVerified === null || user?.phoneVerified === null) &&
               <Button
               className="text-xs px-4 rounded-full w-full h-12"
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