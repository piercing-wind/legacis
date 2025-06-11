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
import { ForgotPasswordSchema } from "@/lib/schema";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { setAuthModel } from "@/lib/slices/authSlice";
import { useAppDispatch } from "@/lib/hooks";
import { setIdentifier, setVerificationType } from "@/lib/slices/profile";
import { sendOTP } from "@/actions/optVerification";
import { toast } from "sonner";

export default function ForgotPassword({className}:{className ?:string}) {
   const [isPending, startTransition] = useTransition();
  
   const dispatch = useAppDispatch();

   const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
     resolver: zodResolver(ForgotPasswordSchema),
     defaultValues: {
       identifier: "",
     },
   });
 
   function onSubmit(values: z.infer<typeof ForgotPasswordSchema>) {
       startTransition(() => {
          sendOTP({identifier: values.identifier, verificationType: 'RESET_PASS_VERIFY'})
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
             dispatch(setAuthModel('otp'));
             dispatch(setVerificationType('RESET_PASS_VERIFY'));
             dispatch(setIdentifier(values.identifier));
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
 
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4 rounded-xl max-w-md w-full shadow-legacisPurple/20 px-8 p-8 flex flex-col", className)}>
        <div className="space-y-4 gap-x-8 w-full">
         <h5 className="pb-4">Reset Password</h5>
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registered Email or Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         </div>
        <Button variant={'legacis'} disabled={isPending} type="submit" className="px-8 cursor-pointer mt-4">Continue </Button>
      </form>
    </Form>
  );
}
