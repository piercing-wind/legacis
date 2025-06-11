"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {  KYCSchema } from "@/lib/schema";
import { EyeIcon, EyeOffIcon, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AppDispatch } from "@/lib/store";
import { verifyPan } from "@/actions/kyc";
import { useSession } from "next-auth/react";
import Loading from "../loading";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getFullUserData, setModalOpen } from "@/lib/slices/profile";
import { useAppDispatch } from "@/lib/hooks";

export default function KYCForm({className}:{className ?:string}) {
  
  const [isPending, startTransition] = useTransition();

  const {update, data} = useSession()
  const user = data?.user;

  const dispatch : AppDispatch = useAppDispatch(); 
  const router = useRouter();



  const form = useForm<z.infer<typeof KYCSchema>>({
    resolver: zodResolver(KYCSchema),
    defaultValues: {
      name: user?.name || "",
      pan: "",
      dob: "",
      state: "",
      city: "",
      zip: "",
      address: "",
      userType : "INDIVIDUAL",
      gstin : '',
    },
  });

 async function onSubmit(values: z.infer<typeof KYCSchema>) {
      startTransition(() => {
         verifyPan(values, user?.id)
          .then(async (res) => {
            if (!res.success) throw new Error(res.message);

            await update({ 
               ...data,
               user: {
                  ...data?.user,
                  name: res.data?.[0].name,
                  panVerified: res.data?.[0].panVerified,
                  userType: res.data?.[0].userType,
               }
            });
            form.reset();
            dispatch(getFullUserData(user?.id));
            dispatch(setModalOpen({ open: true, modelType: 'emailVerification'}));

            toast.success(res.message, {
              duration: 15000,
              action: {
                label: "Close",
                onClick: () => toast.dismiss(),
              },
            });
            
          })
          .catch((error) => {
            toast.error(<h6 style={{color:"red"}}>Verification Failed!</h6>,{
               duration: 15000,
               action: {
                  label: "Close",
                  onClick: () => toast.dismiss(),
               },
               description: `${(error as Error).message}`,
            });
          })
      })
      
  }

  return isPending ? ( <Loading className='rounded-xl !min-h-[70vh] sm:max-w-xl w-full shadow-legacisPurple/20' message="Please wait! We are verifying your provided information." />
    ) : (
       <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className={cn("rounded-xl sm:max-w-4xl w-full shadow-legacisPurple/20 px-8 p-8 flex flex-col bg-white border dark:bg-neutral-800", className)}>
         <div>
             <h5>Complete Your KYC</h5>
             <p>Please fill the entries as per your PAN</p>
         </div>
          <div className="space-y-4 gap-x-8 w-full grid grid-cols-2 mt-12">
           <FormField
             control={form.control}
             name="name"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Name*</FormLabel>
                 <FormControl>
                   <Input placeholder="" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
            <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center gap-4 border-b"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="INDIVIDUAL" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      INDIVIDUAL
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="BUSINESS" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      BUSINESS
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
             control={form.control}
             name="pan"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>PAN*</FormLabel>
                 <FormControl>
                   <Input placeholder="" className="uppercase" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <FormField
             control={form.control}
             name="dob"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Date of Birth*</FormLabel>
                 <FormControl>
                   <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <FormField
             control={form.control}
             name="address"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Address*</FormLabel>
                 <FormControl>
                   <Input placeholder="" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <FormField
             control={form.control}
             name="state"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>State*</FormLabel>
                 <FormControl>
                   <Input placeholder="" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <FormField
             control={form.control}
             name="city"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>City*</FormLabel>
                 <FormControl>
                   <Input placeholder="" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <FormField
             control={form.control}
             name="zip"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>ZIP*</FormLabel>
                 <FormControl>
                   <Input placeholder="" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
         {form.watch('userType') === "BUSINESS" && (
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter GSTIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          </div>
         <Button variant={'legacis'} disabled={isPending} type="submit" className="px-8 my-4 cursor-pointer mt-4">Continue </Button>
          <p className="text-xs">Note: Your Name, DOB etc will be updated as your pan.</p>
       </form>
     </Form>
   )}

