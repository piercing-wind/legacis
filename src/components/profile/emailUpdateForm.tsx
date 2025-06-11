"use client";
import {useTransition} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EmailVerificationSchema } from "@/lib/schema";
import { Info } from "lucide-react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { sendOTP } from "@/actions/optVerification";
import { setIdentifier, setModalOpen, setVerificationType } from "@/lib/slices/profile";
import { useAppDispatch } from "@/lib/hooks";

export default function EmailUpdateForm({className}:{className ?:string}) {
  
  const [isPending, startTransition] = useTransition();
  
  const dispatch = useAppDispatch();
  
  const form = useForm<z.infer<typeof EmailVerificationSchema>>({
    resolver: zodResolver(EmailVerificationSchema),
    defaultValues: {
      email: "",
    },
  });

async function onSubmit(values: z.infer<typeof EmailVerificationSchema>) {
      const identifier = values.email;

      startTransition(() => {
         sendOTP({identifier, verificationType : 'EMAIL_UPDATE'})
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
            dispatch(setModalOpen({ open : true, modelType :'otpVerification'}));
            dispatch(setVerificationType('EMAIL_UPDATE'));
            dispatch(setIdentifier(identifier));
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
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4 rounded-xl max-w-md w-full shadow-legacisPurple/20 px-8 p-8 flex flex-col bg-white border dark:bg-neutral-800", className)}>
        <div className="space-y-4 gap-x-8 w-full">
         <div className="flex items-center justify-between">
            <h5 className="pb-4">Verify Your Email</h5>
            <span className="relative group">
               <Info className="h-4 w-4 text-neutral-400 cursor-pointer" />
               <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded bg-neutral-900 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                  Changing your email address will require you to verify the new email address.
               </span>
            </span>
         </div>
      
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <p className="text-xs">
            We will send you a verification code to your email. Please check your inbox and spam folder for the code.
        </p>
        <Button variant={'legacis'} disabled={isPending} type="submit" className="px-8 cursor-pointer mt-8">Send OTP</Button>
      </form>
    </Form>
  );
}
