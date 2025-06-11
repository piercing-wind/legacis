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
import { RegisterSchema } from "@/lib/schema";
import { Checkbox } from "../ui/checkbox";
import { CheckCircle2, CheckIcon, EyeIcon, EyeOffIcon, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { registerUser } from "@/actions/register";
import { setAuthModel, setAuthOpen } from "@/lib/slices/authSlice";
import { useAppDispatch } from "@/lib/hooks";

export default function Register({className}:{className ?:string}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const dispatch = useAppDispatch();
  
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

async function onSubmit(values: z.infer<typeof RegisterSchema>) {
      if (!isTermsAccepted) {
         toast.error("Please accept the terms and conditions.", {
            duration: 5000,
            action: {
               label: "Close",
               onClick: () => toast.dismiss(),
            },
         });
         return;
      }
      
      startTransition(() => {
         registerUser(values)
          .then((res) => {
            if (!res.success) throw new Error(res.message);

            toast.success(`Welcome ${values.name}!`,{
               duration: 5000,
               action: {
                  label: "Login",
                  onClick: () => {dispatch(setAuthModel('login')); toast.dismiss()},
               },
               icon: <CheckCircle2 color="#4ade80"  size={16}/>,
               description: "You have successfully registered. Please login to continue.",
               style:{
                  fontSize: "16px",
               }
            });

            form.reset();
            dispatch(setAuthModel('login'));
         }).catch((error)=> {
            toast.error(<h6 style={{color:"red"}}>Registration failed</h6>,{
               duration: 5000,
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
         <h5 className="pb-4">Create an Account</h5>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
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
         {/* Terms */}
          <div className="items-top flex space-x-2 mt-8">
            <Checkbox id="terms1" onCheckedChange={(v:boolean)=>setIsTermsAccepted(v)} />
            <div className="grid leading-none">
              <label
                htmlFor="terms1"
                className="text-sm cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accept terms and conditions
              </label>
              <p className="!text-xs text-muted-foreground">
                You agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>

        </div>

        <Button variant={'legacis'} disabled={isPending} type="submit" className="px-8 cursor-pointer mt-4">Register </Button>
      </form>
    </Form>
  );
}
