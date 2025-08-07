'use client';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Coupon, ServicePlan } from "@/prisma/generated/client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CouponFormValues, couponSchema } from "@/lib/schema";
import { saveCoupon } from "@/actions/admin/coupon";
import { toast } from "sonner";



export function CouponForm({
  defaultValues,
  services,
}: {
  defaultValues?: Coupon | null;
  services?: { id: string; name: string, plans: ServicePlan[] }[];
}) {
  const router = useRouter();
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
      defaultValues: {
      id: defaultValues?.id ?? "",
      code: defaultValues?.code ?? "",
      description: defaultValues?.description ?? "",
      percentOff: defaultValues?.percentOff,
      expiryDate: defaultValues?.expiryDate
      ? new Date(defaultValues.expiryDate).toISOString().slice(0, 10)
      : "",
      serviceId: defaultValues?.serviceId ?? "",
      servicePlanId: defaultValues?.servicePlanId ?? "",
    },
  });

   // Watch serviceId to determine if plan dropdown should be shown
  const selectedServiceId = form.watch("serviceId");
  const selectedService = services?.find(s => s.id === selectedServiceId);


  const onSubmit = async (data: CouponFormValues) => {
    try {
      const payload = {
         ...data,
         serviceId: data.serviceId === "global" ? undefined : data.serviceId,
         servicePlanId: data.servicePlanId === "none" ? undefined : data.servicePlanId,
      };
      const res =  await saveCoupon(payload);
      if(!res.success) throw new Error(res.message);
      
      toast.success("Coupon saved successfully!");
      router.refresh();
      router.push("/admin/coupons");
    } catch (error) {
      toast.error(`Failed to save coupon. ${(error as Error).message}`);
    }
  };


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 m-auto bg-white p-6 rounded-xl border w-full"
      >  
         {services && (
            <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
               <FormItem>
               <FormLabel>Select Main Service</FormLabel>
               <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                     <SelectTrigger>
                     <SelectValue placeholder="Select a service" />
                     </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     <SelectGroup>
                     <SelectLabel>Services</SelectLabel>
                     <SelectItem value="global">None (Global Coupon)</SelectItem>
                     {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                           {s.name}
                        </SelectItem>
                     ))}
                     </SelectGroup>
                  </SelectContent>
               </Select>
               <FormMessage />
               </FormItem>
            )}
         />
         )}
         {selectedServiceId && selectedServiceId !== "global" && selectedService && selectedService.plans.length > 0 && (
          <FormField
            control={form.control}
            name="servicePlanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Plan (optional)</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Plans</SelectLabel>
                      <SelectItem value="none">None (Service-wide Coupon)</SelectItem>
                      {selectedService.plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.label} ({plan.durationInDays} days) - ₹{plan.price}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. SAVE20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Optional description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="percentOff"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Percent Off (0-1) </FormLabel>
              <FormControl>
                <Input
                  type="number"
                     step="0.01"
                     min="0"
                     max="1"
                     placeholder="e.g. 0.2 for 20%"
                     value={field.value ?? ""}
                     onChange={e => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value || ""} 
                  onChange={e => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit">Save Coupon</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}