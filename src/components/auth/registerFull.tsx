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
import { RegisterFullSchema } from "@/lib/schema";
import { Checkbox } from "../ui/checkbox";
import { CheckCircle2, CheckIcon, EyeIcon, EyeOffIcon, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"

export default function RegisterFull() {
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);

  const form = useForm<z.infer<typeof RegisterFullSchema>>({
    resolver: zodResolver(RegisterFullSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: "",
      pan: "",
      pincode: "",
      city: "",
      state: "",
      gstNumber: "",
    },
  });

  function onSubmit(values: z.infer<typeof RegisterFullSchema>) {

      if (!isTermsAccepted) {
         toast.error("Please accept the terms and conditions",{
            duration: 5000,
            action: {
               label: "Close",
               onClick: () => toast.dismiss(),
            },
            icon: <X color="#f87171" size={16}/>,
            description: "You have to accept the terms and conditions to proceed.",
            style:{
               fontSize: "16px",
            }
         });
         return;
      }
      toast.success(`Welcome ${values.name}!`,{
         duration: 5000,
         action: {
            label: "Close",
            onClick: () => toast.dismiss(),
         },
         icon: <CheckCircle2 color="#4ade80"  size={16}/>,
         description: "You have successfully registered.",
         style:{
            fontSize: "16px",
         }
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-md shadow-xs max-w-4xl w-full shadow-legacisPurple/20 border px-4 p-16 flex flex-col items-end">
        <div className="space-y-4 gap-x-8 grid grid-cols-3 w-full">
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
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
                <FormLabel>Phone*</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
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
                  <Input placeholder="" {...field} className="uppercase" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gstNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GSTIN</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} className="uppercase" />
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
                <FormLabel>Address</FormLabel>
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
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP</FormLabel>
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
                <FormLabel>City</FormLabel>
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
                <FormLabel>Password*</FormLabel>
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
                      className="ml-2"
                    >
                      {showPassword ? <EyeOffIcon color="#a0a0a0" /> : <EyeIcon color="#a0a0a0"/>}
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
                <FormLabel>Confirm Password*</FormLabel>
                <FormControl>
                  <Input placeholder="" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         {/* Terms */}
          <div className="items-top flex space-x-2">
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

        <Button variant={'legacis'} type="submit" className="px-8 cursor-pointer">Next </Button>
      </form>
    </Form>
  );
}
