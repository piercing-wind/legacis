"use client";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResearchAdvisoryStockList } from "@/prisma/generated/client";
import { ServiceListItem } from "@/app/(admin-routes)/admin/services/page";
import { convertUTCToIST, extractFileKeyFromUrl, generateUniqueS3FileKey, normalizeRationale } from "@/lib/utils";
import { toast } from "sonner";
import {
  deleteResearchAdvisoryStock,
  upsertResearchAdvisoryStocks,
} from "@/actions/admin/services";
import {
  callTypeOptions,
  ResearchAdvisoryStocksFormSchema,
  statusOptions,
} from "@/lib/schema";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteS3File, getS3UploadUrl } from "@/actions/aws-s3";
import { PDFDisplay } from "@/components/pdfDisplay";

function normalizeString(val: unknown): string {
  return val == null ? "" : String(val);
}

function getDateString(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val.length > 16 ? val.slice(0, 16) : val; // "YYYY-MM-DDTHH:mm"
  if (val instanceof Date) return val.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
  return "";
}

type StocksFormValues = z.infer<typeof ResearchAdvisoryStocksFormSchema>;

export function ResearchAdvisoryStockListForm({
  serviceId,
  services,
  initialStocks = [],
  initialServiceId,
}: {
  serviceId?: string;
  services: ServiceListItem[];
  initialServiceId?: string;
  initialStocks?: ResearchAdvisoryStockList[];
}) {
  const router = useRouter();
  const sortedInitialStocks = initialStocks
  ? [...initialStocks].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB; // oldest first
    })
  : [];

  const form = useForm<StocksFormValues>({
    resolver: zodResolver(ResearchAdvisoryStocksFormSchema),
    defaultValues: {
      stocks: sortedInitialStocks.length
        ? sortedInitialStocks.map((stock) => ({
            ...stock,
            sector: stock.sector || "",
            rationale: normalizeRationale(stock.rationale),
            exitRationale: normalizeRationale(stock.exitRationale),
            entryDate: stock.entryDate
              ? convertUTCToIST(stock.entryDate)
              : "",
            exitDate: stock.exitDate
              ? convertUTCToIST(stock.exitDate)
              : "",
            raReport: stock.raReport || "",
          }))
        : [
            {
              name: "",
              serviceId: initialServiceId ?? "",
              stockTicker: "",
              sector: "",
              status: "OPEN",
              callType: "BUY",
              entryPrice: undefined,
              targetPrice: undefined,
              stopLoss: undefined,
              exitPrice: undefined,
              rationale: { text: "" },
              exitRationale: { text: "" },
              raReport: "",
              entryDate: "",
              exitDate: "",
            },
          ],
    },
  });


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stocks",
  });

  async function handleSubmit(values: StocksFormValues) {
    try {
      const changedStocks: typeof values.stocks = [];
      const newStocks: typeof values.stocks = [];

      const initialStockMap = Object.fromEntries(
        (sortedInitialStocks ?? []).filter((s) => s.id).map((s) => [s.id, s])
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
            if (k === "rationale" || k === "exitRationale") {
              if (JSON.stringify(stock[k]) !== JSON.stringify(initial[k])) {
                changedFields.push(k);
              }
            } else if (k === "entryDate" || k === "exitDate") {
              if (getDateString(stock[k]) !== getDateString(initial[k])) {
                changedFields.push(k);
              }
            } else if (k === "sector") {
              if (normalizeString(stock[k]) !== normalizeString(initial[k])) {
                changedFields.push(k);
              }
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
        toast("New stocks added", {
          description: newStocks.map((s) => s.name).join(", "),
        });
      }

      // Only sending changed and new stocks
      const stocksToUpsert = [...changedStocks, ...newStocks];
      if (stocksToUpsert.length === 0) {
        toast("No changes detected");
        return;
      }

      const result = await upsertResearchAdvisoryStocks({
        stocks: stocksToUpsert,
      });
      if (!result.success) throw new Error(result.message);
      toast.success("Stocks updated successfully");
      if (serviceId) {
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
          throw new Error(
            errorData.message || "Failed to send stock update emails"
          );
        }
        toast.success("Stock update emails sent successfully");
      }

      router.refresh();
    } catch (error) {
      toast.error(
        `Failed to update stocks: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8 w-full"
        autoComplete="off"
      >
        {fields.map((field, idx) => {
         const stockStatus = form.watch(`stocks.${idx}.status`);
         return(
            <div key={field.id} className="border p-4 rounded mb-4 space-y-4">
               <div className="flex justify-between items-center">
               <h4 className="font-semibold">
                  {field.name
                     ? `${field.name} #${idx + 1} `
                     : `New Stock #${idx + 1}`}
               </h4>
               {fields.length > 1 && (
                  <Dialog>
                     <DialogTrigger asChild>
                     <Button type="button" variant="destructive" size="sm">
                        Remove
                     </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[425px]">
                     <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                           This action cannot be undone. This will permanently
                           delete stock and user will not be notified for this.
                           <br />
                           <br />
                           <br />
                           Maybe you want to update the stock instead?
                        </DialogDescription>
                     </DialogHeader>

                     <Button
                        variant="destructive"
                        onClick={async () => {
                           const stockId = form.getValues(`stocks.${idx}.id`);
                           try {
                           if (!stockId) {
                              remove(idx);
                              return;
                           }
                           const res = await deleteResearchAdvisoryStock(
                              stockId
                           );
                           if (!res.success) {
                              throw new Error(res.message);
                           }
                           remove(idx);
                           toast.success("Stock removed successfully");
                           } catch (error) {
                           toast.error(
                              `Failed to remove stock: ${
                                 error instanceof Error
                                 ? error.message
                                 : "Unknown error"
                              }`
                           );
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
                        <Select value={field.value} onValueChange={field.onChange}>
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

               <div className="flex flex-col md:flex-row gap-4 items-center w-full">
               <FormField
                  control={form.control}
                  name={`stocks.${idx}.name`}
                  render={({ field }) => (
                     <FormItem className="flex-1">
                     <FormLabel>Name</FormLabel>
                     <FormControl>
                        <Input {...field} placeholder="Stock Name" />
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
                     <FormLabel>Ticker</FormLabel>
                     <FormControl>
                        <Input {...field} placeholder="Ticker" />
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
                           {...field}
                           placeholder="Sector"
                           value={field.value ?? ""}
                        />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={form.control}
                  name={`stocks.${idx}.status`}
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Status</FormLabel>
                     <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                           <SelectTrigger>
                           <SelectValue placeholder="Status" />
                           </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {statusOptions.map((opt) => (
                           <SelectItem key={opt} value={opt}>
                              {opt}
                           </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name={`stocks.${idx}.callType`}
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Call Type</FormLabel>
                     <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                           <SelectTrigger>
                           <SelectValue placeholder="Call Type" />
                           </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {callTypeOptions.map((opt) => (
                           <SelectItem key={opt} value={opt}>
                              {opt}
                           </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     <FormMessage />
                     </FormItem>
                  )}
               />
            </div>
            <div className="flex flex-wrap gap-4">
               <FormField
                  control={form.control}
                  name={`stocks.${idx}.entryPrice`}
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Entry Price</FormLabel>
                     <FormControl>
                        <Input
                           {...field}
                           type="number"
                           step="any"
                           placeholder="Entry Price"
                           value={field.value ?? ""}
                           onChange={(e) =>
                           field.onChange(
                              e.target.value === ""
                                 ? undefined
                                 : Number(e.target.value)
                           )
                           }
                        />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name={`stocks.${idx}.targetPrice`}
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Target Price</FormLabel>
                     <FormControl>
                        <Input
                           {...field}
                           type="number"
                           step="any"
                           placeholder="Target Price"
                           value={field.value ?? ""}
                           onChange={(e) =>
                           field.onChange(
                              e.target.value === ""
                                 ? undefined
                                 : Number(e.target.value)
                           )
                           }
                        />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name={`stocks.${idx}.stopLoss`}
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Stop Loss</FormLabel>
                     <FormControl>
                        <Input
                           {...field}
                           type="number"
                           step="any"
                           placeholder="Stop Loss"
                           value={field.value ?? ""}
                           onChange={(e) =>
                           field.onChange(
                              e.target.value === ""
                                 ? undefined
                                 : Number(e.target.value)
                           )
                           }
                        />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />
   
               <FormField
                  control={form.control}
                  name={`stocks.${idx}.entryDate`}
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Entry Date</FormLabel>
                     <FormControl>
                        <Input
                           {...field}
                           type="datetime-local"
                           placeholder="Entry Date"
                           value={field.value ?? ""}
                           onChange={field.onChange}
                        />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name={`stocks.${idx}.raReport`}
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
                              <DialogTrigger asChild>
                                 <Button variant="outline" className="mt-2 max-w-xs">
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
            {stockStatus === "CLOSED" && (
               <div className="flex flex-wrap gap-4">
                     <FormField
                     control={form.control}
                     name={`stocks.${idx}.exitDate`}
                     render={({ field }) => (
                        <FormItem>
                        <FormLabel>Exit Date</FormLabel>
                        <FormControl>
                           <Input
                              {...field}
                               type="datetime-local"
                              placeholder="Exit Date"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                           />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name={`stocks.${idx}.exitPrice`}
                     render={({ field }) => (
                        <FormItem>
                        <FormLabel>Exit Price</FormLabel>
                        <FormControl>
                           <Input
                              {...field}
                              type="number"
                              step="any"
                              placeholder="Exit Price"
                              value={field.value ?? ""}
                              onChange={(e) =>
                              field.onChange(
                                 e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value)
                              )
                              }
                           />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                     )}
                  />
                  
               </div>
               )}
               <div className="flex flex-col md:flex-row gap-4">
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
                  <FormField
                     control={form.control}
                     name={`stocks.${idx}.exitRationale.text`}
                     render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormLabel>Exit Rationale</FormLabel>
                        <FormControl>
                           <Textarea {...field} placeholder="Exit Rationale" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
            </div>
         )}
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              name: "",
              serviceId: serviceId || "",
              stockTicker: "",
              sector: "",
              status: "OPEN",
              callType: "BUY",
              entryPrice: undefined,
              targetPrice: undefined,
              stopLoss: undefined,
              rationale: { text: "" },
              exitRationale: { text: "" },
              entryDate: "",
              exitDate: "",
            })
          }
        >
          Add Stock
        </Button>
        <Button type="submit" className="ml-4">
          Save
        </Button>
      </form>
    </Form>
  );
}
