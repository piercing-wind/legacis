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
import { ChangePasswordSchema } from "@/lib/schema";
import { Info } from "lucide-react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { sendOTP } from "@/actions/optVerification";
import { useAppDispatch } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import { changePassword } from "@/actions/changePassword";

export default function ChangePasswordForm({className}:{className ?:string}) {
  
  const [isPending, startTransition] = useTransition();
  const { data, status} = useSession()
  const dispatch = useAppDispatch();
  
  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

async function onSubmit(values: z.infer<typeof ChangePasswordSchema>) {
      if(status === 'loading' || status === 'unauthenticated') {
         toast.error('Please Login first')
      }
      const identifier = data?.user?.email;

      startTransition(() => {
         changePassword({
            identifier: identifier || "", 
            currentPassword: values.currentPassword, 
            newPassword: values.newPassword
         })
         .then((res) => {
            if(!res.success) throw new Error(res.message);
            toast.success(`${res.message}`, {
               duration: 30000,
               action: {
                  label: "Close",
                  onClick: () => toast.dismiss(),
               },
            });

            form.reset();
         }).catch((error)=> {
            toast.error(<h6 style={{color:"red"}}>{(error as Error).message}</h6>,{
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
            <h5 className="pb-4 font-medium text-2xl">Change Your Password!</h5>
      
         </div>
      
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input 
                     type="password"
                     placeholder="" 
                     {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
               control={form.control}
               name="newPassword"
               render={({ field }) => (
               <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                     <Input type="password" placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
               </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="confirmNewPassword"
               render={({ field }) => (
               <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                     <Input type="password" placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
               </FormItem>
               )}
            />
        </div>

        <Button variant={'legacis'} disabled={isPending} type="submit" className="px-8 cursor-pointer mt-8">Change Password</Button>
      </form>
    </Form>
  );
}
