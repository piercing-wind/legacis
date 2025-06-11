'use client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import { useState, useTransition } from "react";
import { sendOTP, verifyOTP } from "@/actions/optVerification";
import { toast } from "sonner";
// import { PDFDisplay } from "../pdfDisplay";
import dynamic from "next/dynamic";

const PDFDisplay = dynamic(() => import("../pdfDisplay").then(mod => mod.PDFDisplay), {
  ssr: false,
});

export default function ConsentForm({className}: {className?: string}) {
   const [showOTPForm, setShowOTPFOrm] = useState(false);
   const [isPending, startTransition] = useTransition();
   const {data, update} = useSession()
   const user : User = data?.user;
   const identifier = user?.phone || user?.email;
   const form = useForm({
     defaultValues: {
       otp: "",
     },
   });
   const handleIagree = () => {
      startTransition(() => {
         sendOTP({identifier, verificationType : 'CONSENT'})
         .then((res) => {
            if (!res.success) throw new Error(res.message);

            toast.success(<h6>OTP Sent!</h6>,{
               duration: 10000,
               action: {
                  label: "Close",
                  onClick: () => toast.dismiss(),
               },
               description: `${res.message}`,
            });
            setShowOTPFOrm(true);
            form.reset();
         }).catch((error)=> {
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

   const onSubmit = (values: { otp: string }) => {
      startTransition(() => {
             verifyOTP({identifier, otp: values.otp})
              .then(async (res) => {
                if (!res.success) throw new Error(res.message);
                
               await update({
                   ...data,
                   user: {
                      ...data?.user,
                      ...res.res
                   }
                })
    
                toast.success(<h6>Thank you!</h6>, {
                   duration: 10000,
                   action: {
                      label: "Close",
                      onClick: () => toast.dismiss(),
                   },
                   description: `${res.message}`,
                });
                form.reset();
          
              })
              .catch((err) => {
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
    <div className="flex flex-col items-center bg-white under dark:bg-neutral-900 border rounded-lg p-4 max-w-xl w-full min-h-[90vh] overflow-y-scroll overflow-x-hidden">
      <h5 className="text-2xl font-bold">
        Please Accept our Terms & Condition
      </h5>
      <p className="text-sm mb-2">Read Carefully</p>
      <div className="w-full mb-4 overflow-y-auto overflow-x-hidden h-[60vh]">
         <PDFDisplay fileUrl="/agreement.pdf"/>
      </div>
      {!showOTPForm && 
      <Button onClick={handleIagree}>I Agree</Button>
      }
      {showOTPForm && 
         <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4 rounded-xl w-full shadow-legacisPurple/20 px-8 p-8 flex flex-col", className)}>
         <div className="space-y-4 gap-x-8 w-full flex items-end">
            <FormField
               control={form.control}
               name="otp"
               render={({ field }) => (
               <FormItem className="flex-1 mb-0">
                  <FormLabel>Enter the OTP send on {user.phone}</FormLabel>
                  <FormControl>
                     <Input placeholder="" {...field} className="border border-neutral-400" />
                  </FormControl>
                  <FormMessage />
               </FormItem>
               )}
            />
            <Button variant={'legacis'} type="submit" className=" flex-1 px-8 cursor-pointer mt-4">Continue </Button>
            </div>
         </form>
         </Form>
      }
    </div>
  );
};
