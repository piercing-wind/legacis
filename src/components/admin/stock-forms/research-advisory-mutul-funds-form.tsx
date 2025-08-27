'use client';

import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ResearchAdvisoryMutualFundFormSchema, ResearchAdvisoryModelPortfolioStockSchema } from "@/lib/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner";
import { extractFileKeyFromUrl, generateUniqueS3FileKey, normalizeRationale } from "@/lib/utils";
import { ServiceListItem } from "@/app/(admin-routes)/admin/services/page";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteResearchAdvisoryModelPortfolioStock, deleteResearchAdvisoryMutualFundStock, upsertResearchAdvisoryModelPortfolio, upsertResearchAdvisoryMutualFundStocks } from "@/actions/admin/services";
import { Textarea } from "@/components/ui/textarea";
import { ResearchAdvisoryMutualFundStockList } from "@/prisma/generated/client";

type StocksFormValues = z.infer<typeof ResearchAdvisoryMutualFundFormSchema>;
/**
 * 
 */
export const ResearchAdvisoryMutualFundStockListForm =(
   { 
      initialStocks = [], 
      serviceId,
      services = []
   }: {
      initialStocks?: ResearchAdvisoryMutualFundStockList[],
      serviceId: string,
      services: ServiceListItem[];
   }
)=>{
   const router = useRouter();
   const sortedInitialStocks = initialStocks
   ? [...initialStocks].sort((a, b) => {
         const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
         const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
         return dateA - dateB; // oldest first
      })
   : [];

   const form = useForm<StocksFormValues>({
       resolver: zodResolver(ResearchAdvisoryMutualFundFormSchema),
       defaultValues: {
          stocks: sortedInitialStocks.length 
          ? sortedInitialStocks.map(stock => ({
             ...stock,
             rationale: normalizeRationale(stock.rationale)
          }))
            : [{ 
               serviceId, 
               name: '',
               category: '',
               weight: 0,
               rationale: { text: "" }
            }],
       }

   })
   const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "stocks",
   });

   async function handleSubmit(values: StocksFormValues) {
      try {
         const changedStocks: typeof values.stocks = [];
         const newStocks: typeof values.stocks = [];
         
         const initialStockMap = Object.fromEntries(
            (sortedInitialStocks ?? []).filter(s => s.id).map(s => [s.id, s])
         );
           values.stocks.forEach((stock) => {
               const initial = stock.id ? initialStockMap[stock.id] : undefined;
               if (!initial) {
                  newStocks.push(stock); // New stock
               } else {
                  // Find changed fields
                  const changedFields: string[] = [];
                  Object.keys(stock).forEach((key) => {
                     const k = key as keyof typeof stock;
                     if (k === 'id' || k === 'serviceId') {
                        // Skip keys you don't want to compare
                        return;
 
                     } else {
                        if (stock[k] !== initial[k]) {
                           changedFields.push(k);
                        }
                     }
                  });
   
                  if (changedFields.length > 0) {
                  changedStocks.push(stock);
                  toast(`Stock "${stock.name}" changed`, {
                     description: `Fields changed: ${changedFields.join(", ")}`,
                  });
                  }
               }
            });

            // Information to admin
            if (newStocks.length > 0) {
               toast("New stocks added",{
                  description: newStocks.map(s => s.name).join(", "),
               });
            }
            // Only sending changed and new stocks
            const stocksToUpsert = [...changedStocks, ...newStocks];
            if (stocksToUpsert.length === 0) {
               toast("No changes detected");
               return;
            }

            const result = await upsertResearchAdvisoryMutualFundStocks({ stocks: stocksToUpsert })
            if(!result.success) throw new Error(result.message);
            toast.success("Stocks updated successfully");
            if(serviceId) {
               const res = await fetch("/api/send-stock-update", {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                     serviceId,
                  }),
               });
               if (!res.ok) {
                  const errorData = await res.json();
                  throw new Error(errorData.message || "Failed to send stock update emails");
               }
                toast.success("Stock update emails sent successfully");
            }
         router.refresh();
      } catch (error) {
          toast.error(`Failed to update stocks: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-14">
            {fields.map((field, idx) => (
               <div key={field.id} className="space-y-4 border p-4 rounded-lg">
                  <div className="flex justify-between items-center ">
                     <h4 className="font-semibold">{field.name ?`${field.name} #${idx+1} `: `New Stock #${idx + 1}` }</h4>
                     {fields.length > 1 && (
                        <Dialog>
                           <DialogTrigger asChild>
                              <Button
                                 type="button"
                                 variant="destructive"
                                 size="sm"
                              >
                                 Remove
                              </Button>
                           </DialogTrigger>
                           <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                 <DialogTitle>Are you absolutely sure?</DialogTitle>
                                 <DialogDescription>
                                 This action cannot be undone. This will permanently stock
                                 and user will not be notified for this.
                                 <br/>
                                 <br/>
                                 <br/>
                                 Maybe you want to update the stock instead?

                                 </DialogDescription>
                              </DialogHeader>
         
                                 <Button
                                    variant="destructive"
                                    onClick={async () => {
                                       const stockId = form.getValues(`stocks.${idx}.id`);
                                       try {
                                          if(!stockId) {
                                             remove(idx);
                                             return;
                                          }
                                          const res = await deleteResearchAdvisoryMutualFundStock(stockId);
                                          if (!res.success) {
                                             throw new Error(res.message);
                                          }
                                          remove(idx);
                                          toast.success("Stock removed successfully");
                                       } catch (error) {
                                          toast.error(`Failed to remove stock: ${error instanceof Error ? error.message : "Unknown error"}`);
                                       }
                                    }}
                                 >
                                    Remove
                                 </Button>
                           </DialogContent>
                        </Dialog>
                     )}
                  </div>
                  <FormField
                     control={form.control}
                     name={`stocks.${idx}.serviceId`}
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Service</FormLabel>
                           <Select
                           value={field.value}
                           onValueChange={field.onChange}
                           >
                           <FormControl>
                              <SelectTrigger>
                                 <SelectValue placeholder="Select Service" />
                              </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                              {services.map((service) => (
                                 <SelectItem key={service.id} value={service.id}>
                                 {service.name}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                  )}
                  />
                  <div className="w-full flex items-center">

                     <FormField
                        control={form.control}
                        name={`stocks.${idx}.name`}
                        render={({ field }) => (
                           <FormItem className="flex-1">
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                 <Input placeholder="Stock Name" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name={`stocks.${idx}.category`}
                        render={({ field }) => (
                           <FormItem className="flex-1">
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                 <Input 
                                    placeholder="Category" 
                                    {...field} 
                                    value={field.value ?? ""}

                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name={`stocks.${idx}.weight`}
                        render={({ field }) => (
                           <FormItem className="flex-1">
                              <FormLabel>Weight (%)</FormLabel>
                              <FormControl>
                                 <Input
                                    type="number"
                                    placeholder="Weight"
                                    {...field}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
      
                  </div>
                  <FormField
                     control={form.control}
                     name={`stocks.${idx}.rationale.text`}
                     render={({ field }) => (
                        <FormItem className="flex-1">
                           <FormLabel>Rationale</FormLabel>
                           <FormControl>
                           <Textarea {...field} placeholder="Rationale" />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
            ))}
         <div className="flex gap-4">
            <Button
               type="button"
               variant="outline"
               onClick={() => append({ 
                  id: '', 
                  serviceId, 
                  name: '', 
                  category: '', 
                  weight: 0, // Default value
                  rationale: { text: "" } // Default value
               })}   
            >
               Add Stock
            </Button>
            <Button type="submit">
               Save Model Portfolio Stocks
            </Button>
               
         </div>

         </form>
      </Form>
   )
}
