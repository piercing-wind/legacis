"use client";

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
import { NewPasswordSchema } from "@/lib/schema";
import { EyeIcon, EyeOffIcon, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { resetPassword } from "@/actions/resetPassword";
import { setAuthModel } from "@/lib/slices/authSlice";

export default function ResetPassword({className}:{className ?:string}) {
  const [showPassword, setShowPassword] = useState(false);
  const {identifier} = useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

   function onSubmit(values: z.infer<typeof NewPasswordSchema>) {
     if (!identifier) {
       toast.error("No identifier found for password reset.");
       return;
     }
     startTransition(() => {
       resetPassword({ identifier, newPassword: values.password })
         .then((res) => {
             if (!res.success) throw new Error(res.message);
   
             toast.success(<h6>Password Reset Successful!</h6>, {
                duration: 10000,
                action: {
                label: "Close",
                onClick: () => toast.dismiss(),
                },
                description: `${res.message}`,
             });
             dispatch(setAuthModel('login'));
             form.reset();
         })
         .catch((error) => {
           toast.error((error as Error).message);
         });
     });
   }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4 rounded-xl max-w-md w-full shadow-legacisPurple/20 px-8 p-8 flex flex-col", className)}>
        <div className="space-y-4 gap-x-8 w-full">
         <h5 className="pb-4">Set your new password!</h5>
           <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Input
                      placeholder=""
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2 cursor-pointer"
                    >
                      {showPassword ? <EyeOffIcon size={16} color="#a0a0a0" /> : <EyeIcon size={16} color="#a0a0a0"/>}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder="" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         </div>
        <Button variant={'legacis'} disabled={isPending} type="submit" className="px-8 cursor-pointer mt-4">Save</Button>
      </form>
    </Form>
  );
}
