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

type ELSSFormValues = {
  initialInvestment: number;
  years: number;
  expectedReturn: number;
};

export default function ELSSCalculator() {
  const defaultValues = {
    initialInvestment: 20000,
    years: 3,
    expectedReturn: 18,
  };

  const form = useForm<ELSSFormValues>({
    defaultValues,
  });

  const [futureValue, setFutureValue] = useState<number | null>(null);
  const [returns, setReturns] = useState<number | null>(null);

  // FV = C × (1 + r) ^ t
  function calculateELSS({ initialInvestment, years, expectedReturn }: ELSSFormValues) {
    const r = expectedReturn / 100;
    const FV = initialInvestment * Math.pow(1 + r, years);
    const invested = initialInvestment;
    const earned = FV - invested;
    return { FV, earned };
  }

  function onSubmit(values: ELSSFormValues) {
    const { FV, earned } = calculateELSS(values);
    setFutureValue(FV);
    setReturns(earned);
  }

  function handleReset() {
    form.reset(defaultValues);
    setFutureValue(null);
    setReturns(null);
  }

  return (
    <div className="max-w-4xl w-full shrink-0 p-6 rounded-xl flex flex-col md:flex-row items-start gap-8 shadow-2xl">
      <div className="flex-1 w-full">
        <h2 className="text-xl font-medium mb-4">ELSS Calculator</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="initialInvestment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invested Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min={500} step={100} {...field} />
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
                  <FormLabel>Investment Duration (years)</FormLabel>
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
          <h3 className="text-lg font-medium mb-2">Your ELSS Summary</h3>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Invested Amount:</span>
            <span className="text-lg md:text-xl">
              ₹{form.watch("initialInvestment").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Estimated Returns:</span>
            <span className="text-lg md:text-xl">
              ₹{returns !== null
                ? returns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "0.00"}
            </span>
          </div>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Total Value:</span>
            <span className="text-lg md:text-xl">
              ₹{futureValue !== null
                ? futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "0.00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}