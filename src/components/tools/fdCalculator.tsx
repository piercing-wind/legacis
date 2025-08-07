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
import { useForm } from "react-hook-form";
import { useState } from "react";

type Frequency = "annually" | "semi-annually" | "quarterly" | "monthly" | "simple";

type FDFormValues = {
  principal: number;
  rate: number;
  tenure: number;
  frequency: Frequency;
};

function calculateFD({ principal, rate, tenure, frequency }: FDFormValues) {
  let maturity = 0;
  let interest = 0;
  if (frequency === "simple") {
    // Simple Interest
    interest = (principal * rate * tenure) / 100;
    maturity = principal + interest;
  } else {
    // Compound Interest
    let n = 1;
    if (frequency === "annually") n = 1;
    if (frequency === "semi-annually") n = 2;
    if (frequency === "quarterly") n = 4;
    if (frequency === "monthly") n = 12;
    maturity = principal * Math.pow(1 + rate / (n * 100), n * tenure);
    interest = maturity - principal;
  }
  return { maturity, interest, principal };
}

export default function FDCalculator() {
  const defaultValues = {
    principal: 100000,
    rate: 6,
    tenure: 5,
    frequency: "annually" as Frequency,
  };

  const form = useForm<FDFormValues>({
    defaultValues,
  });

  const [result, setResult] = useState<{ maturity: number; interest: number; principal: number } | null>(null);

  function onSubmit(values: FDFormValues) {
    setResult(calculateFD(values));
  }

  function handleReset() {
    form.reset(defaultValues);
    setResult(null);
  }

  return (
    <div className="max-w-4xl w-full md:mx-auto p-6 rounded-xl flex flex-col md:flex-row items-start gap-8 shadow-2xl">
      <div className="flex-1 w-full">
        <h2 className="text-xl font-medium mb-4">FD (Fixed Deposit) Calculator</h2>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} step={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate of Interest (% p.a.)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0.1} step={0.01} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenure (Years)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0.1} step={0.01} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compounding Frequency</FormLabel>
                  <Select {...field} onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="annually">Annually</SelectItem>
                      <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="simple">Simple Interest</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2 mt-4">
              <Button type="submit" className="w-full">
                Calculate
              </Button>
              <Button type="button" className="w-full" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {/* Result Card always visible on right */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full rounded-xl p-6 bg-neutral-100 dark:bg-neutral-800">
          <h3 className="text-lg font-medium mb-2">FD Result</h3>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="font-medium">Maturity Amount:</span>
            <span className="text-xl">
              ₹{result ? result.maturity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
            </span>
          </div>
          <div className="mt-4 text-xs">
            * This is an estimate based on your inputs. Actual returns may vary.
          </div>
        </div>
      </div>
    </div>
  );
}