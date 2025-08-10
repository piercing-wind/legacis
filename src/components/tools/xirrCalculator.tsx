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

type Frequency = "fortnightly" | "monthly" | "quarterly" | "half-yearly" | "yearly";

type CashFlow = {
  date: string;
  amount: number;
};

type XIRRFormValues = {
  startDate: string;
  endDate: string;
  frequency: Frequency;
  investmentAmount: number;
  maturityAmount: number;
};

function calculateXIRR(cashFlows: CashFlow[]): number | null {
  if (cashFlows.length < 2) return null;

  const sortedFlows = cashFlows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Try more negative-friendly initial guesses (must be > -1)
  const initialGuesses = [-0.9, -0.8, -0.7, -0.6, -0.5, -0.3, -0.1, 0.01, 0.1, 0.2];

  for (const initialRate of initialGuesses) {
    const result = calculateWithGuess(sortedFlows, initialRate);
    if (result !== null && isFinite(result)) {
      return result * 100; // percentage
    }
  }
  return null;
}

function calculateWithGuess(sortedFlows: CashFlow[], initialRate: number): number | null {
  let rate = initialRate;
  const maxIterations = 1000;
  const precision = 1e-10;
  const MIN_RATE = -0.999999; // never go below -100%
  const MAX_RATE = 50;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;
    const baseDate = new Date(sortedFlows[0].date);

    // Clamp at safe minimum
    if (rate <= MIN_RATE) rate = MIN_RATE;

    const onePlusRate = 1 + rate;
    if (onePlusRate <= 0 || !isFinite(onePlusRate)) return null;

    for (const flow of sortedFlows) {
      const days = (new Date(flow.date).getTime() - baseDate.getTime()) / 86400000;
      const years = days / 365.25;

      const discountFactor = Math.pow(onePlusRate, -years);
      npv += flow.amount * discountFactor;

      // d/d r of (1+r)^(-t) = -t * (1+r)^(-t-1)
      dnpv -= flow.amount * years * discountFactor / onePlusRate;
    }

    if (!isFinite(npv) || !isFinite(dnpv)) return null;

    if (Math.abs(npv) < precision) return rate;
    if (Math.abs(dnpv) < precision) return null;

    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < precision) return newRate;

    rate = newRate;
    if (rate <= MIN_RATE || rate > MAX_RATE) return null;
  }
  return null;
}

function generateCashFlows(values: XIRRFormValues): CashFlow[] {
  const { startDate, endDate, frequency, investmentAmount, maturityAmount } = values;
  
  if (!startDate || !endDate || investmentAmount <= 0 || maturityAmount <= 0) {
    return [];
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end <= start) return [];
  
  const cashFlows: CashFlow[] = [];
  
  // Add investment cash flows (negative values as they are outflows)
  let currentDate = new Date(start);
  
  while (currentDate < end) { // Changed <= to < to avoid duplicate on end date
    cashFlows.push({
      date: currentDate.toISOString().split('T')[0],
      amount: -Math.abs(investmentAmount) // Ensure negative value
    });
    
    // Move to next investment date based on frequency
    switch (frequency) {
      case 'fortnightly':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() + 3);
        break;
      case 'half-yearly':
        currentDate.setMonth(currentDate.getMonth() + 6);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }
  
  // Always add final maturity amount (positive value as it's an inflow)
  cashFlows.push({
    date: endDate,
    amount: Math.abs(maturityAmount) // Ensure positive value
  });
  
  return cashFlows;
}

export default function XIRRCalculator() {
  const form = useForm<XIRRFormValues>({
    defaultValues: {
      startDate: "",
      endDate: "",
      frequency: "monthly",
      investmentAmount: 0,
      maturityAmount: 0,
    },
  });

  const [result, setResult] = useState<number | null>(null);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);

  function onSubmit(values: XIRRFormValues) {
    const flows = generateCashFlows(values);
    
    setCashFlows(flows);
    
    if (flows.length < 2) {
      setResult(null);
      toast.error("Please enter valid values. Ensure all fields are filled and end date is after start date.");
      return;
    }
    
    const xirrValue = calculateXIRR(flows);
    if (xirrValue === null) {
      setResult(null);
      toast.error("Unable to calculate XIRR. Please check your input values.");
    } else {
      setResult(xirrValue);
      toast.success("XIRR calculated successfully.");
    }
  }

  function handleReset() {
    form.reset();
    setResult(null);
    setCashFlows([]);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-xl flex flex-col md:flex-row gap-8 shadow-2xl items-start">
      <div className="flex-1 w-full">
        <h2 className="text-xl font-medium mb-4">XIRR Calculator</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Frequency</FormLabel>
                  <Select {...field} onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="fortnightly">Fortnightly</SelectItem>
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
                     <FormLabel>Maturity Date</FormLabel>
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
                  name="investmentAmount"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Investment Amount (₹)</FormLabel>
                        <FormControl>
                        <Input 
                           type="number" 
                           min={0} 
                           step={100} 
                           {...field}
                           onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
               control={form.control}
               name="maturityAmount"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Maturity Amount (₹)</FormLabel>
                     <FormControl>
                     <Input 
                        type="number" 
                        min={0} 
                        step={100} 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                     />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
               />
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <Button type="submit" className="w-full">
                Calculate XIRR
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </div>
      
      {/* Result Card */}
      <div className="flex-1 w-full space-y-4">
        <div className="w-full rounded-xl p-6 bg-neutral-100 dark:bg-neutral-800">
          <h3 className="text-lg font-medium mb-2">XIRR Result</h3>
          <div className="mb-2 flex gap-4 items-end justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Annualized Return:</span>
            <span className={`text-lg md:text-xl font-medium ${
              result !== null 
                ? result < 0 
                  ? 'text-red-500' 
                  : 'text-green-600' 
                : ''
            }`}>
              {result !== null ? `${result.toFixed(2)}%` : "--"}
            </span>
          </div>
          <div className="mt-4 text-xs">
            * XIRR is calculated based on your cash flows and dates. Actual returns may vary.
          </div>
        </div>
        
        {/* Cash Flow Summary */}
        {cashFlows.length > 0 && (
          <div className="w-full rounded-xl p-6 bg-neutral-100 dark:bg-neutral-800">
            <h3 className="text-lg font-medium mb-2">Cash Flow Summary</h3>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
              Total Investments: {cashFlows.filter(cf => cf.amount < 0).length}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              Total Invested: ₹{Math.abs(cashFlows.filter(cf => cf.amount < 0).reduce((sum, cf) => sum + cf.amount, 0)).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}