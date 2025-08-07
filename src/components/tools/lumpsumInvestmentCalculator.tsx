'use client';
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type LumpsumFormValues = {
  investmentAmount: number;
  years: number;
  expectedReturn: number;
};

export default function LumpsumInvestmentCalculator() {
  const defaultValues = {
    investmentAmount: 500000,
    years: 10,
    expectedReturn: 12,
  };

  const form = useForm<LumpsumFormValues>({
    defaultValues,
  });

  const [futureValue, setFutureValue] = useState<number | null>(null);

  // FV = Investment Amount × (1 + Annual Return) ^ Duration
  function calculateLumpsum({ investmentAmount, years, expectedReturn }: LumpsumFormValues) {
    const r = expectedReturn / 100;
    const FV = investmentAmount * Math.pow(1 + r, years);
    return FV;
  }

  function onSubmit(values: LumpsumFormValues) {
    const FV = calculateLumpsum(values);
    setFutureValue(FV);
  }

  function handleReset() {
    form.reset(defaultValues);
    setFutureValue(null);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-xl flex flex-col md:flex-row items-start gap-8 shadow-2xl">
      <div className="flex-1 w-full">
        <h2 className="text-xl font-medium mb-4">Lumpsum Investment Calculator</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="investmentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1000} step={1000} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Period (years)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={50} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expectedReturn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Annual Return (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0.1} max={20} step={0.1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full">Calculate</Button>
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
          <h3 className="text-lg font-medium mb-2">Investment Summary</h3>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Invested Amount:</span>
            <span className="font-medium text-lg md:text-xl">
              ₹{form.watch("investmentAmount").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Total Value:</span>
            <span className="font-medium text-lg md:text-xl">
              ₹{futureValue !== null
                ? futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "0.00"}
            </span>
          </div>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Estimated Returns:</span>
            <span className="font-medium text-lg md:text-xl">
              ₹{futureValue !== null
                ? (futureValue - form.watch("investmentAmount")).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "0.00"}
            </span>
          </div>
          <div className="mt-4 text-xs ">
            * This calculation assumes annual compounding. Actual returns may vary.
          </div>
        </div>
      </div>
    </div>
  );
}