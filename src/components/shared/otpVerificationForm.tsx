"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { nullable, z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { Input } from "@/components/ui/input";
import { FormSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";


import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect, useState, useTransition } from "react";
import { sendOTP, verifyOTP } from "@/actions/optVerification";
import { setIdentifier, setModalOpen } from "@/lib/slices/profile";
import { useSession } from "next-auth/react";
import { setAuthModel, setAuthOpen } from "@/lib/slices/authSlice";



export default function OTPVerificationForm({className}:{className ?:string}) {
  const dispatch = useAppDispatch();
  const { identifier, verificationType } = useAppSelector((state) => state.profile); 
  const [timer, setTimer] = useState(120);
  const [isPending, startTransition] = useTransition();
  const {update, data} = useSession()

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleModalActions = () => {
    switch (verificationType) {
      case "RESET_PASS_VERIFY":
        dispatch(setModalOpen({ open: false }));
        dispatch(setAuthOpen(true));
        dispatch(setAuthModel("reset-password"));
        break;
      case "EMAIL_VERIFY":
        dispatch(setModalOpen({ open: true, modelType: "phoneVerification" }));
        break;
      default:
        dispatch(setModalOpen({ open: false }));
    }
  };

  function onSubmit(values: z.infer<typeof FormSchema>) {
       if (!identifier) {
         toast.error("Identifier is missing.");
         return;
      }

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

            toast.success(<h6>OTP Verified!</h6>, {
               duration: 10000,
               action: {
                  label: "Close",
                  onClick: () => toast.dismiss(),
               },
               description: `${res.message}`,
            });
            form.reset();
            handleModalActions()
          }).catch((err) => {
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

  function handleResendOTP() {
      if (timer > 0) return;

      if (!identifier) {
         toast.error("Email is missing.");
         return;
      }

      startTransition(() => {
          sendOTP({identifier, verificationType})
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
             setTimer(120);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4 rounded-xl bg-white border max-w-xl w-full shadow-legacisPurple/20 px-8 p-8 flex flex-col", className)}>
        <div className="space-y-4 gap-x-8 w-full">
         <div className="flex items-center justify-between">
           <h5 className="pb-4">OTP</h5>
           <div>
               <Button 
                  variant={'link'}
                  disabled={timer > 0 || isPending}     
                  onClick={handleResendOTP}    
               >
                  Resend OTP
               </Button>
                {timer > 0 && (
                 <span>{formatTime(timer)}</span>
               )}
           </div>
         </div>
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="leading-6">Please enter the code sent on {identifier}.</FormLabel>
                <FormControl>
                   <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         </div>
        <Button variant={'legacis'} disabled={isPending} type="submit" className="px-8 cursor-pointer mt-4">Verify </Button>
      </form>
    </Form>
  );
}
