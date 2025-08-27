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
import { ResearchAdvisoryModelPortfolioFormSchema, ResearchAdvisoryModelPortfolioStockSchema } from "@/lib/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner";
import { extractFileKeyFromUrl, generateUniqueS3FileKey } from "@/lib/utils";
import { deleteS3File, getS3UploadUrl } from "@/actions/aws-s3";
import { PDFDisplay } from "@/components/pdfDisplay";
import { ServiceListItem } from "@/app/(admin-routes)/admin/services/page";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteResearchAdvisoryModelPortfolioStock, upsertResearchAdvisoryModelPortfolio } from "@/actions/admin/services";
import { ResearchAdvisoryModelPortfolioStockList } from "@/prisma/generated/client";

type StocksFormValues = z.infer<typeof ResearchAdvisoryModelPortfolioFormSchema>;
/**
 * 
 */
export const ResearchAdvisoryModelPortfolioStockListForm =(
   { 
      initialStocks = [], 
      serviceId ,
      services = []
   }: {
      initialStocks?: ResearchAdvisoryModelPortfolioStockList[],
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
       resolver: zodResolver(ResearchAdvisoryModelPortfolioFormSchema),
       defaultValues: {
          stocks: sortedInitialStocks.length
          ? sortedInitialStocks.map(stock => ({
             ...stock,
             sector : stock.sector || '',
             portfolioWeight: stock.portfolioWeight ?? 0, // Ensure portfolioWeight is defined
             researchReport: stock.researchReport ?? '', // Ensure researchReport is defined
          }))
            : [{ 
               serviceId, 
               name: '', 
               stockTicker: '', 
               sector: '', 
               portfolioWeight: 0, // Default value
               researchReport: '' // Default value
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

            // Only sending changed and new stocks
            const stocksToUpsert = [...changedStocks, ...newStocks];
            if (stocksToUpsert.length === 0) {
               toast("No changes detected");
               return;
            }

            // Information to admin
            if (newStocks.length > 0) {
               toast("New stocks added",{
                  description: newStocks.map(s => s.name).join(", "),
               });
            }
            
            const result = await upsertResearchAdvisoryModelPortfolio({ stocks: stocksToUpsert });
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
         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                                 This action cannot be undone. This will permanently delete the stock
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
                                       const researchReportUrl = form.getValues(`stocks.${idx}.researchReport`);
                                       try {
                                          if (researchReportUrl) {
                                            const prevKey = extractFileKeyFromUrl(researchReportUrl);
                                            if (prevKey) {
                                              await deleteS3File(prevKey);
                                            }
                                          }
                                          if(!stockId) {
                                             remove(idx);
                                             return;
                                          }
                                          const res = await deleteResearchAdvisoryModelPortfolioStock(stockId);
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
                        name={`stocks.${idx}.stockTicker`}
                        render={({ field }) => (
                           <FormItem className="flex-1">
                              <FormLabel>Stock Ticker</FormLabel>
                              <FormControl>
                                 <Input placeholder="Stock Ticker" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name={`stocks.${idx}.sector`}
                        render={({ field }) => (
                           <FormItem className="flex-1">
                              <FormLabel>Sector</FormLabel>
                              <FormControl>
                                 <Input 
                                    placeholder="Sector" 
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
                        name={`stocks.${idx}.portfolioWeight`}
                        render={({ field }) => (
                           <FormItem className="flex-1">
                              <FormLabel>Portfolio Weight (%)</FormLabel>
                              <FormControl>
                                 <Input
                                    type="number"
                                    placeholder="Portfolio Weight"
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
                     name={`stocks.${idx}.researchReport`}
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Research Report (PDF)</FormLabel>
                           <FormControl>
                           <Input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 if (!file) return;
                                 try {
                                    if (field.value) {
                                       const prevKey = extractFileKeyFromUrl(field.value);
                                       if (prevKey) {
                                          await deleteS3File(prevKey);
                                       }
                                    }
                                    // Generate unique key and upload to S3
                                    const fileKey = generateUniqueS3FileKey(file.name, 'research-report');
                                    const uploadUrl = await getS3UploadUrl(fileKey, file.type, 300, file.name);
                                    const res = await fetch(uploadUrl, {
                                       method: "PUT",
                                       body: file,
                                       headers: { 
                                          "Content-Type": file.type, 
                                          "Content-Disposition": `attachment; filename="${file.name}"`
                                       }
                                       
                                    });
                                    if (!res.ok) throw new Error("Failed to upload");
                                    // Set the S3 file URL to this stock's researchReport field
                                    field.onChange(`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${fileKey}`);
                                    toast.success("PDF uploaded!");
                                 } catch (err) {
                                 toast.error((err as Error).message);
                                 }
                              }}
                           />
                           </FormControl>
                           {/* Optionally show a link if already uploaded */}
                           {field.value && (
                              <Dialog>
                                 <DialogTrigger asChild className="max-w-xs">
                                    <Button variant='outline'>
                                       View Uploaded PDF
                                    </Button>
                                 </DialogTrigger>
                                 <DialogContent className="sm:max-w-5xl">
                                    <DialogHeader>
                                       <DialogTitle>Uploaded Research Report</DialogTitle>
                                       <DialogDescription>
                                          You cannot download the uploaded PDF report.
                                       </DialogDescription>
                                    </DialogHeader>
                                    <PDFDisplay fileUrl={field.value}/>
                                 </DialogContent>
                              </Dialog>
                           )}
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
                  stockTicker: '', 
                  sector: '', 
                  portfolioWeight: 0, // Default value
                  researchReport: '' // Default value
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
