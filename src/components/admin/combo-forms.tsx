"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ComboFormSchema, ComboFormValues } from "@/lib/schema";
import { attachComplimentaryServices } from "@/actions/admin/combo";
import { ServiceWithComplimentary } from "@/lib/data/admin/combo";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ServiceType } from "@/prisma/generated/client";

export function ComboAttachForm({ allServices, editServiceId }: { allServices: ServiceWithComplimentary[], editServiceId?: string | null; }) {
  
  const router = useRouter();
  const [complimentaryServices, setComplimentaryServices] = useState<Array<{
    serviceId: string;
    planId?: string;
  }>>([]);

  const form = useForm<ComboFormValues>({
    resolver: zodResolver(ComboFormSchema),
    defaultValues: {
      serviceId: editServiceId || "",
      complimentaryServiceIds: [],
    },
  });

  const selectedServiceId = form.watch("serviceId");
  const lastServiceId = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedServiceId) {
      form.setValue("complimentaryServiceIds", []);
      setComplimentaryServices([]);
      lastServiceId.current = null;
      return;
    }
    
    if (lastServiceId.current !== selectedServiceId) {
      const selectedService = allServices.find(s => s.id === selectedServiceId);
      if (selectedService) {
        const existingComplimentary = selectedService.complimentaryService.map(cs => ({
          serviceId: cs.complimentaryService.id,
          planId: (cs as any).complimentaryServicePlanId || undefined,
        }));
        
        form.setValue("complimentaryServiceIds", existingComplimentary.map(c => c.serviceId));
        setComplimentaryServices(existingComplimentary);
      }
      lastServiceId.current = selectedServiceId;
    }
  }, [selectedServiceId, allServices, form]);

  const handleComplimentaryServiceChange = (serviceId: string, checked: boolean) => {
    const service = allServices.find(s => s.id === serviceId);
    
    if (checked) {
      form.setValue("complimentaryServiceIds", [...form.getValues("complimentaryServiceIds"), serviceId]);
      
      // Only set default plan for Portfolio Review services
      const newComplimentary = {
        serviceId,
        planId: service?.type === ServiceType.PORTFOLIO_REVIEW 
          ? (service?.plans?.[0]?.id || undefined)
          : undefined
      };
      setComplimentaryServices(prev => [...prev, newComplimentary]);
    } else {
      form.setValue("complimentaryServiceIds", form.getValues("complimentaryServiceIds").filter(id => id !== serviceId));
      setComplimentaryServices(prev => prev.filter(c => c.serviceId !== serviceId));
    }
  };

  const updatePlan = (serviceId: string, planId: string) => {
    setComplimentaryServices(prev => 
      prev.map(c => 
        c.serviceId === serviceId 
          ? { ...c, planId: planId || undefined }
          : c
      )
    );
  };

  const handleSubmit = async (values: ComboFormValues) => {
    const formData = {
      serviceId: values.serviceId,
      complimentaryServices
    };
    
    const result = await attachComplimentaryServices(formData);
    if (result.success) {
      toast.success("Combo services updated!");
      router.refresh();
    } else {
      toast.error(result.message || "Failed to update combo services.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                  {allServices.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="complimentaryServiceIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Complimentary Services</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {allServices
                  .filter(s => s.id !== selectedServiceId)
                  .map(service => {
                    const isSelected = field.value.includes(service.id);
                    const complimentaryService = complimentaryServices.find(c => c.serviceId === service.id);
                    const isPortfolioReview = service.type === ServiceType.PORTFOLIO_REVIEW;
                    
                    return (
                      <div key={service.id} className="border p-4 rounded">
                        <label className="flex items-center gap-2 mb-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleComplimentaryServiceChange(service.id, !!checked)
                            }
                          />
                          <span className="font-medium">{service.name}</span>
                        </label>

                        {/* Show plan selection ONLY for Portfolio Review services */}
                        {isSelected && isPortfolioReview && service.plans && service.plans.length > 0 && (
                          <div className="ml-6 mt-2">
                            <label className="text-sm font-medium">Select Stock Plan:</label>
                            <Select 
                              value={complimentaryService?.planId || ""} 
                              onValueChange={(planId) => updatePlan(service.id, planId)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select stock plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {service.plans
                                  .filter(plan => plan.isActive)
                                  .map(plan => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                      {plan.label}
                                      {plan.stockLimit && ` - ${plan.stockLimit} stocks`}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              Select how many stocks the user can upload for portfolio review
                            </p>
                          </div>
                        )}

                        {/* Show message if Portfolio Review has no plans */}
                        {isSelected && isPortfolioReview && (!service.plans || service.plans.length === 0) && (
                          <div className="ml-6 mt-2">
                            <p className="text-sm text-orange-600">
                              This Portfolio Review service has no stock plans configured.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button disabled={!selectedServiceId || form.formState.isSubmitting} type="submit">
          Save Combo Services
        </Button>
      </form>
    </Form>
  );
}