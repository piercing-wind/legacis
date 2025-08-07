'use client';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";

type Frequency = "monthly" | "quarterly" | "half-yearly" | "yearly";

type XIRRFormValues = {
  startDate: string;
  endDate: string;
  investmentType: Frequency;
  startValue: number;
  endValue: number;
};

function calculateXIRR({ startDate, endDate, startValue, endValue }: XIRRFormValues): number | null {
  if (!startDate || !endDate || startValue <= 0 || endValue <= 0) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (years <= 0) return null;
  const xirr = Math.pow(endValue / startValue, 1 / years) - 1;
  if (!isFinite(xirr) || xirr < -1) return null;
  return xirr * 100;
}


export default function XIRRCalculator() {
  const form = useForm<XIRRFormValues>({
    defaultValues: {
      startDate: "",
      endDate: "",
      investmentType: "monthly",
      startValue: 0,
      endValue: 0,
    },
  });

  const [result, setResult] = useState<number | null>(null);

  function onSubmit(values: XIRRFormValues) {
    const xirrValue = calculateXIRR(values);
    if (xirrValue === null) {
      setResult(null);
      toast.error("Please enter valid values. Start Value and End Value must be greater than zero, and End Date must be after Start Date.");
    } else {
      setResult(xirrValue);
      toast.success("XIRR calculated successfully.");
    }
  }

  function handleReset() {
    form.reset();
    setResult(null);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-xl flex flex-col md:flex-row gap-8 shadow-2xl items-start">
      <div className="flex-1 w-full">
        <h2 className="text-xl font-medium mb-4">XIRR Calculator</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="investmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Type</FormLabel>
                  <Select {...field} onValueChange={field.onChange} defaultValue={field.value} >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
               control={form.control}
               name="startDate"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Start Date</FormLabel>
                     <FormControl>
                     <Input type="date" {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
               />
               <FormField
               control={form.control}
               name="endDate"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>End Date</FormLabel>
                     <FormControl>
                     <Input type="date" {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">               
               <FormField
               control={form.control}
               name="startValue"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Start Value (₹)</FormLabel>
                     <FormControl>
                     <Input type="number" min={0} step={100} {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
               />
               <FormField
               control={form.control}
               name="endValue"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>End Value (₹)</FormLabel>
                     <FormControl>
                     <Input type="number" min={0} step={100} {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
               />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Button type="submit" className="w-full">
                Calculate
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {/* Result Card */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full rounded-xl p-6 bg-neutral-100 dark:bg-neutral-800">
          <h3 className="text-lg font-medium mb-2">XIRR Result</h3>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Annualized Return:</span>
            <span className="text-lg md:text-xl font-medium">
              {result !== null ? `${result.toFixed(2)}%` : "--"}
            </span>
          </div>
          <div className="mt-4 text-xs ">
            * XIRR is calculated based on your cash flows and dates. Actual returns may vary.
          </div>
        </div>
      </div>
    </div>
  );
}