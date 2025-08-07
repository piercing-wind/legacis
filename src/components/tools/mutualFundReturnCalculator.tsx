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
import { useForm } from "react-hook-form";
import { useState } from "react";

type MFFormValues = {
  amount: number;
  rate: number;
  years: number;
};

function calculateMF({ amount, rate, years }: MFFormValues) {
  const futureValue = amount * Math.pow(1 + rate / 100, years);
  const invested = amount;
  const estimatedReturn = futureValue - invested;
  return { invested, estimatedReturn, futureValue };
}

export default function MutualFundReturnCalculator() {
  const defaultValues = {
    amount: 100000,
    rate: 10,
    years: 5,
  };

  const form = useForm<MFFormValues>({
    defaultValues,
  });

  const [result, setResult] = useState<{ invested: number; estimatedReturn: number; futureValue: number } | null>(null);

  function onSubmit(values: MFFormValues) {
    setResult(calculateMF(values));
  }

  function handleReset() {
    form.reset(defaultValues);
    setResult(null);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-xl flex flex-col md:flex-row items-start gap-8 shadow-2xl">
      <div className="flex-1 w-full">
        <h2 className="text-xl font-medium mb-4">Mutual Fund Return Calculator</h2>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Amount (₹)</FormLabel>
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
                  <FormLabel>Expected Rate of Return (% per annum)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} step={0.01} {...field} />
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
                  <FormLabel>Investment Duration (Years)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} step={1} {...field} />
                  </FormControl>
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
          <h3 className="text-lg font-medium mb-2">Your Mutual Fund Summary</h3>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Invested Amount:</span>
            <span className="text-lg md:text-xl font-medium">
              ₹{result ? result.invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
            </span>
          </div>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Estimated Returns:</span>
            <span className="text-lg md:text-xl font-medium">
              ₹{result ? result.estimatedReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
            </span>
          </div>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Total Value:</span>
            <span className="text-lg md:text-xl font-medium">
              ₹{result ? result.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
            </span>
          </div>
          <p className="mt-4 text-xs">
            * This is an estimate based on your inputs. Actual returns may vary.
          </p>
        </div>
      </div>
    </div>
  );
}