"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  RiskLevel,
  RiskLevelServiceRecommendation,
} from "@/prisma/generated/client";
import { toast } from "sonner";
import { saveRiskLevelRecommendation } from "@/actions/riskLevelServiceRecommendation";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

const riskLevelSchema = z.object({
  riskLevel: z.nativeEnum(RiskLevel),
  services: z.array(z.string()).min(1, "Select at least one service"),
});

type RiskLevelServiceRecommendationFormValues = z.infer<typeof riskLevelSchema>;

export function RiskLevelServiceRecommendationForm({
  recommendations, // Array of all RiskLevelServiceRecommendation objects
  allServices, // Array of { id: string, name: string }
}: {
  recommendations: RiskLevelServiceRecommendation[];
  allServices: { id: string; name: string }[];
}) {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel>(
    recommendations[0]?.riskLevel || "CONSERVATIVE"
  );

  // Find current recommendation for selected risk level
  const currentRecommendation = recommendations.find(
    (rec) => rec.riskLevel === selectedRiskLevel
  );

  const form = useForm<RiskLevelServiceRecommendationFormValues>({
    resolver: zodResolver(riskLevelSchema),
    defaultValues: {
      riskLevel: selectedRiskLevel,
      services: currentRecommendation?.services || [],
    },
    values: {
      riskLevel: selectedRiskLevel,
      services: currentRecommendation?.services || [],
    },
  });

  // When risk level changes, update form values
  const handleRiskLevelChange = (riskLevel: RiskLevel) => {
    setSelectedRiskLevel(riskLevel);
    const rec = recommendations.find((r) => r.riskLevel === riskLevel);
    form.reset({
      riskLevel,
      services: rec?.services || [],
    });
  };

  const handleFormSubmit = async (
    data: RiskLevelServiceRecommendationFormValues
  ) => {
    try {
      const res = await saveRiskLevelRecommendation(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      toast.success("Recommendation saved!", {
        description: `Risk Level: ${data.riskLevel}`,
      });
    } catch (error) {
      toast.error("Failed to save recommendation", {
        description: (error as Error).message,
      });
    }
  };
  return (
    <Form {...form}>
      <form
        className="space-y-6 p-4"
        onSubmit={form.handleSubmit((data) => handleFormSubmit(data))}
      >
        <FormField
          control={form.control}
          name="riskLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-lg">Risk Level Service Recommendation</FormLabel>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val as RiskLevel);
                  handleRiskLevelChange(val as RiskLevel);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSERVATIVE">Conservative</SelectItem>
                  <SelectItem value="MODERATE">Moderate</SelectItem>
                  <SelectItem value="AGGRESSIVE">Aggressive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />


         <FormField
         control={form.control}
         name="services"
         render={({ field }) => (
            <FormItem>
               <FormLabel>Services</FormLabel>
               <FormControl>
               <div className="flex flex-wrap gap-2">
                  {allServices.map((service) => (
                     <Label key={service.id} className="flex items-center gap-2 cursor-pointer">
                     <Checkbox
                        checked={field.value.includes(service.id)}
                        onCheckedChange={(checked) => {
                           if (checked) {
                           field.onChange([...field.value, service.id]);
                           } else {
                           field.onChange(field.value.filter((id) => id !== service.id));
                           }
                        }}
                        id={service.id}
                     />
                        <span className="font-normal">{service.name}</span>
                     </Label>
                  ))}
               </div>
               </FormControl>
               <FormMessage />
            </FormItem>
         )}
         />

        <div className="flex gap-2">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
