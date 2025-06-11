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
import { LoginSchema } from "@/lib/schema";
import { EyeIcon, EyeOffIcon, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { login } from "@/actions/login";
import { getSession, setAuthModel, setAuthOpen } from "@/lib/slices/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { AppDispatch } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";

export default function Login({className}:{className ?:string}) {
  
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dispatch : AppDispatch = useAppDispatch(); 
  const router = useRouter();

  const params = useSearchParams(); 
  const callbackurl = params.get("callbackurl");


  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof LoginSchema>) {
      startTransition(() => {
         login(values)
          .then((res) => {
            if (!res.success) throw new Error(res.message);
            toast.success(res.message, {
              duration: 5000,
              action: {
                label: "Close",
                onClick: () => toast.dismiss(),
              },
            });
            
            dispatch(setAuthOpen(false));
            if(callbackurl){
               router.push(decodeURIComponent(callbackurl));
            }else{
               window.location.reload();
            }
          })
          .catch((error) => {
            toast.error(<h6 style={{color:"red"}}>Login failed</h6>,{
               duration: 5000,
               action: {
                  label: "Close",
                  onClick: () => toast.dismiss(),
               },
               description: `${(error as Error).message}`,
            });
          })
      })

  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4 rounded-xl max-w-md w-full shadow-legacisPurple/20 p-8 flex flex-col", className)}>
        <div className="space-y-4 gap-x-8 w-full">
         <h5 className="pb-4">Login</h5>
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email, Phone or Username</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            <Button
              variant={'link'}
              type="button"
              className="self-start p-0 rounded-full cursor-pointer mt-2 flex items-center justify-center gap-8"
              onClick={() => dispatch(setAuthModel('forgot-password'))} 
            >
              Forgot Password?
            </Button>
         </div>
        <Button variant={'legacis'} disabled={isPending} type="submit" className="px-8 cursor-pointer mt-4">Login </Button>
      </form>
    </Form>
  );
}
