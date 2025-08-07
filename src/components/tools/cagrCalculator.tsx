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

type CAGRFormValues = {
  initialValue: number;
  finalValue: number;
  years: number;
};

function calculateCAGR({ initialValue, finalValue, years }: CAGRFormValues) {
  if (initialValue <= 0 || finalValue <= 0 || years <= 0) return { cagr: null, absolute: null };
  const cagr = Math.pow(finalValue / initialValue, 1 / years) - 1;
  const absolute = ((finalValue - initialValue) / initialValue) * 100;
  return { cagr: cagr * 100, absolute };
}

export default function CGARCalculator() {
 const defaultValues = {
    initialValue: 10000,
    finalValue: 16000,
    years: 5,
  };
  const defaultResult = calculateCAGR(defaultValues);

  const form = useForm<CAGRFormValues>({
    defaultValues,
  });

  const [result, setResult] = useState<{ cagr: number | null; absolute: number | null }>(defaultResult);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(values: CAGRFormValues) {
    const { cagr, absolute } = calculateCAGR(values);
    if (cagr === null || absolute === null) {
      setResult({ cagr: null, absolute: null });
      setError("Please enter valid values. All values must be greater than zero.");
    } else {
      setResult({ cagr, absolute });
      setError(null);
    }
  }

  function handleReset() {
    form.reset();
    setResult(defaultResult);
    setError(null);
  }

  return (
    <div className="w-full p-6 rounded-xl flex flex-col md:flex-row items-start gap-8 shadow-2xl">
      <div className="flex-1 w-full">
         <h2 className="text-xl font-medium mb-4">CAGR Calculator</h2>
         <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
               control={form.control}
               name="initialValue"
               render={({ field }) => (
               <FormItem>
                  <FormLabel>Initial Investment Value (₹)</FormLabel>
                  <FormControl>
                     <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
               </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="finalValue"
               render={({ field }) => (
               <FormItem>
                  <FormLabel>Final Investment Value (₹)</FormLabel>
                  <FormControl>
                     <Input type="number" min={1} {...field} />
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
                  <FormLabel>Investment Period (Years)</FormLabel>
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
               <Button type="button" variant="outline" className="w-full" onClick={handleReset}>
               Reset
               </Button>
               {error && (
               <div className="text-red-600 text-sm mt-2">{error}</div>
               )}
            </div>
         </form>
         </Form>
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
         <div className="mt-6 rounded-xl p-4 w-full bg-neutral-100 dark:bg-neutral-800">
            <h3 className="text-lg font-medium mb-2">Results</h3>
            <div className="mb-2 flex gap-4 items-end justify-between">
               <span className="text-sm text-neutral-600 dark:text-neutral-300">CAGR:</span>
               <span className="text-lg md:text-xl font-medium">
                  {result.cagr !== null ? `${result.cagr.toFixed(2)}%` : "--"}
               </span>
            </div>
       
         </div>
      </div>
    </div>
  );
}