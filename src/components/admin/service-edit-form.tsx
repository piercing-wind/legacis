"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { ServiceType } from "@/prisma/generated/client";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AgreementIdName } from "@/lib/data/admin/agreement";
import { Checkbox } from "../ui/checkbox";
import { ServiceWithStocksAndAgreements } from "@/lib/data/admin/services";
import { serviceUpdate } from "@/actions/admin/services";
import { useRouter } from "next/navigation";
import { ServiceFormSchema, ServiceFormValues } from "@/lib/schema";
import dynamic from "next/dynamic";
import { formatDateWithTime } from "@/lib/utils";
const QuillRenderPage = dynamic(() => import("../quill"), { ssr: false });

// Service Plan interface
interface ServicePlanValues {
  id?: string;
  serviceId?: string;
  label: string;
  durationInDays: number;
  price: number;
  discount?: number; // Remove | null, use only undefined
  isActive: boolean; // Required, not optional
  stockLimit?: number | null; // This can stay as is
}


function ServiceEditForm({ service, agreement, onTypeChange}: { service?: ServiceWithStocksAndAgreements | null, agreement : AgreementIdName[], onTypeChange?: (type: string) => void}) {  
   const router = useRouter();
   const [quillInstance, setQuillInstance] = useState<any>(null)
   
   // Initialize service plans
   const [plans, setPlans] = useState<ServicePlanValues[]>(
      (service?.plans?.map(plan => ({
         id: plan.id,
         serviceId: plan.serviceId,
         label: plan.label,
         durationInDays: plan.durationInDays,
         price: plan.price,
         discount: plan.discount ?? undefined, // never null
         isActive: plan.isActive,
         stockLimit: plan.stockLimit ?? undefined,
      })) || [
         {
            label: "Monthly",
            durationInDays: 30,
            price: 0,
            discount: undefined,
            isActive: true,
            stockLimit: undefined,
         }
      ])
   );

// ...existing code...

const form = useForm<ServiceFormValues>({
  resolver: zodResolver(ServiceFormSchema),
  defaultValues: service
    ? {
        id: service.id,
        name: service.name,
        slug: service.slug,
        order: service.order ?? 1,
        tag: service.tag ?? "",
        label: service.label ?? "",
        serviceClass: service.serviceClass ?? "",
        description: service.description ?? "",
        chart: service.chart ? JSON.stringify(service.chart, null, 2) : "",
        comparisonTitle: service.comparisonTitle ?? "",
        philosophy: service.philosophy
          ? JSON.stringify(service.philosophy, null, 2)
          : "",
        recommendedService: service.recommendedService?.join(", ") ?? "",
        taxPercent: service.taxPercent ?? undefined,
        features: service.features
          ? JSON.stringify(service.features, null, 2)
          : "",
        faq: service.faq ? JSON.stringify(service.faq, null, 2) : "",
        active: service.active,
        type: service.type as ServiceType,
        agreements: service.agreements?.map(a => a.agreement.id) ?? [],
        detailMutualFundPageDelta: service.detailMutualFundPageDelta
          ? typeof service.detailMutualFundPageDelta === "string"
            ? service.detailMutualFundPageDelta
            : JSON.stringify(service.detailMutualFundPageDelta)
          : "",
        afterPurchaseFeaturesDelta: service.afterPurchaseFeaturesDelta
          ? typeof service.afterPurchaseFeaturesDelta === "string"
            ? service.afterPurchaseFeaturesDelta
            : JSON.stringify(service.afterPurchaseFeaturesDelta)
          : "",
       plans: plans,
      }
    : {
        name: "",
        slug: "",
        order: 1,
        tag: "",
        label: "",
        serviceClass: "",
        description: "",
        chart: "",
        comparisonTitle: "",
        philosophy: "",
        recommendedService: "",
        taxPercent: 18,
        features: "",
        faq: "",
        active: true,
        type: Object.values(ServiceType)[0] as ServiceType,
        agreements: [],
        detailMutualFundPageDelta: "",
        afterPurchaseFeaturesDelta: "",
        plans: plans,
      },
});

  const selectedType = useWatch({ control: form.control, name: "type" }) as ServiceType;

  useEffect(() => {
    if (onTypeChange) onTypeChange(selectedType);
  }, [selectedType, onTypeChange]);


      // Service Plan Management Functions
   const addPlan = () => {
      const newPlan: ServicePlanValues = {
         label: "",
         durationInDays: 30,
         price: 0,
         discount: undefined,
         isActive: true,
         stockLimit: selectedType === 'PORTFOLIO_REVIEW' ? undefined : undefined,
      };
      const newPlans = [...plans, newPlan];
      setPlans(newPlans);
      form.setValue('plans', newPlans);
   };

   const removePlan = (index: number) => {
      if (plans.length > 1) {
         const newPlans = plans.filter((_, i) => i !== index);
         setPlans(newPlans);
         form.setValue('plans', newPlans);
      }
   };

   const updatePlan = (index: number, field: keyof ServicePlanValues, value: any) => {
      const newPlans = [...plans];
      newPlans[index] = { ...newPlans[index], [field]: value };
      setPlans(newPlans);
      form.setValue('plans', newPlans);
   };

  async function onSubmit(values: ServiceFormValues) {
    try {
      if (values.chart) JSON.parse(values.chart);
      if (values.philosophy) JSON.parse(values.philosophy);
      if (values.features) JSON.parse(values.features);
      if (values.faq) JSON.parse(values.faq);

      
      const res = await serviceUpdate(values);
      if(!res.success) throw new Error(res.message || "Unknown error");
      toast.success("Service saved!");
      router.refresh();
    } catch (e: any) {
         let field = "";
         try { if (values.chart) JSON.parse(values.chart); } catch { field = "Chart"; }
         if (!field) try { if (values.philosophy) JSON.parse(values.philosophy); } catch { field = "Philosophy"; }
         if (!field) try { if (values.features) JSON.parse(values.features); } catch { field = "Features"; }
         if (!field) try { if (values.faq) JSON.parse(values.faq); } catch { field = "FAQ"; }


      if (e instanceof SyntaxError) {
      toast.error(
        `There's a formatting error in the "${field}" field.\n\n` +
        "• Please use only double quotes (\") and do not leave any extra commas at the end.\n" +
        "• If you are unsure, you can copy your text and check it at https://jsonlint.com.\n\n" +
        "Once fixed, please try saving again."
      );
      } else {
         console.error("Error updating service:", e);
         toast.error(`${e.message || e}`);
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Form errors:", errors);
          toast.error("Please fix the form errors and try again.");
        })}
        className="space-y-6 bg-white p-6 rounded-xl border max-w-7xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Slug *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Tag *</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Label</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serviceClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Service Class</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
             control={form.control}
             name="order"
             render={({ field }) => (
             <FormItem>
                <FormLabel className="font-medium">Order</FormLabel>
                <FormControl>
                   <Input type="number" {...field} value={field.value ?? 1} />
                </FormControl>
                <FormMessage />
             </FormItem>
             )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Description *</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comparisonTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Comparison Title</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recommendedService"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Recommended Service (comma separated) *</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taxPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Tax % *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Active</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Type *</FormLabel>
                <FormControl>
                 <Select
                     value={field.value}
                     onValueChange={field.onChange}
                  >
                     <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                     </SelectTrigger>
                     <SelectContent>
                        {Object.values(ServiceType).map((type) => (
                        <SelectItem key={type} value={type}>
                           {type}
                        </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chart"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Chart (JSON)</FormLabel>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  {`
                     [
                        {
                           "date": "31-10-2023",
                           "main": 101.04,
                           "comparison": 97.16
                        },
                        {
                           "date": "30-11-2023",
                           "main": 111.29,
                           "comparison": 104.02
                        }
                     ]
                  `}
                  </pre>
                <FormControl>
                  <Textarea rows={2} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="philosophy"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Philosophy (JSON) </FormLabel>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  {`
                     [
                        {
                           "title": "Momentum is King",
                           "description": "We spot early signs of price+volume breakouts."
                        },
                        {
                           "title": "Quick Swings",
                           "description": "Trades last 3–15 days for rapid capital rotation."
                        }
                     ]
                  `}
                  </pre>
                <FormControl>
                  <Textarea rows={2} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Features (JSON) *</FormLabel>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  {`
                     {
                     "highlights": [
                        {
                           "name": "CAGR (SI)",
                           "value": "57%"
                        },
                        {
                           "name": "Annual Return",
                           "value": "58%"
                        }
                       ]
                     }
                  `}
                  </pre>
                <FormControl>
                  <Textarea rows={2} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="faq"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">FAQ (JSON) *</FormLabel>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  {`
                     {
                       "faq": [
                           {
                              "a": "Gain access to alpha-generating strategies designed for growth.",
                              "q": "Why Choose Momentum Thrust? "
                           },
                           {
                              "a": "A swing trading service focused on momentum stocks.",
                              "q": "What is Momentum Thrust?"
                           }
                        ]
                      }
                  `}
                  </pre>
                <FormControl>
                  <Textarea rows={2} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

         {selectedType==='RESEARCH_ADVISORY_MUTUAL_FUNDS' && (
            <FormField
              control={form.control}
              name="detailMutualFundPageDelta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mutual Fund Page Content</FormLabel>
                  <FormControl>
                    <div className="w-full mb-24 min-h-[80vh]">
                     <QuillRenderPage
                        defaultValue={
                           typeof service?.detailMutualFundPageDelta === "string"
                              ? JSON.parse(service.detailMutualFundPageDelta)
                              : service?.detailMutualFundPageDelta
                        }
                        enableImageUpload
                        onQuillReady={(quill: any) => {
                           setQuillInstance(quill);
                           quill.on("text-change", () => {
                             form.setValue("detailMutualFundPageDelta", JSON.stringify(quill.getContents()));
                           });
                        }}
                        />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
         )}
         {selectedType !== 'PLATINA_WEALTH' && selectedType !== 'PORTFOLIO_REVIEW' && (
            <FormField
              control={form.control}
              name="afterPurchaseFeaturesDelta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>After Purchase Data</FormLabel>
                  <FormControl>
                    <div className="w-full mb-24 min-h-96">
                     <QuillRenderPage
                        defaultValue={
                           typeof service?.afterPurchaseFeaturesDelta === "string"
                              ? JSON.parse(service.afterPurchaseFeaturesDelta)
                              : service?.afterPurchaseFeaturesDelta
                        }
                        enableImageUpload
                        onQuillReady={(quill: any) => {
                           setQuillInstance(quill);
                           quill.on("text-change", () => {
                             form.setValue("afterPurchaseFeaturesDelta", JSON.stringify(quill.getContents()));
                           });
                        }}
                        />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
         )}

        </div>
        {/* Service Plans */}
        <div className="col-span-full border-t pt-6">
            <div className="flex items-center justify-between mb-4">
               <FormLabel className="font-medium text-lg">Service Plans</FormLabel>
               <Button type="button" onClick={addPlan} variant="outline" size="sm">
                  Add Plan
               </Button>
            </div>
         
         {plans.map((plan, index) => (
            <div key={index} className="border p-4 rounded-lg mb-4 bg-gray-50">
               <div className="flex items-center justify-between mb-3">
               <h4 className="font-medium text-sm text-gray-700">Plan {index + 1}</h4>
               <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={() => removePlan(index)}
                  disabled={plans.length <= 1}
               >
                  Remove
               </Button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <FormField
                  control={form.control}
                  name={`plans.${index}.label`}
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Plan Label *</FormLabel>
                     <FormControl>
                        <Input 
                           {...field}
                           value={plan.label}
                           onChange={(e) => updatePlan(index, 'label', e.target.value)}
                           placeholder="e.g., Monthly, Quarterly"
                        />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />
               
               <FormField
                  control={form.control}
                  name={`plans.${index}.price`}
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Price *</FormLabel>
                     <FormControl>
                        <Input 
                           type="number"
                           step="0.01"
                           min="0"
                           value={plan.price}
                           onChange={(e) => updatePlan(index, 'price', parseFloat(e.target.value) || 0)}
                           placeholder="0.00"
                        />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />
               
               <FormField
                  control={form.control}
                  name={`plans.${index}.durationInDays`}
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Duration (Days) *</FormLabel>
                     <FormControl>
                        <Input 
                           type="number"
                           value={plan.durationInDays === undefined || plan.durationInDays === null ? "" : plan.durationInDays}
                           onChange={(e) => {
                              const val = e.target.value;
                              updatePlan(index, 'durationInDays', val === "" ? undefined : parseInt(val));
                           }}
                           placeholder="30"
                        />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />
               
               <FormField
                  control={form.control}
                  name={`plans.${index}.discount`}
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Discount (0-1)</FormLabel>
                     <FormControl>
                        <Input 
                           type="number"
                           step="0.01"
                           min="0"
                           max="1"
                           value={plan.discount !== undefined && plan.discount !== null ? plan.discount : ""}
                           onChange={(e) => {
                              const val = e.target.value;
                              // Allow 0 and any number between 0 and 1, only treat empty as undefined
                              updatePlan(index, 'discount', val === "" ? undefined : parseFloat(val));
                           }}
                           placeholder="0.10 for 10%"
                        />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />
               
               {selectedType === 'PORTFOLIO_REVIEW' && (
                  <FormField
                     control={form.control}
                     name={`plans.${index}.stockLimit`}
                     render={({ field }) => (
                     <FormItem>
                        <FormLabel>Stock Limit</FormLabel>
                        <FormControl>
                           <Input 
                           type="number"
                           min="0"
                           value={plan.stockLimit || ""}
                           onChange={(e) => updatePlan(index, 'stockLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                           placeholder="Optional"
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                     )}
                  />
               )}
               
               <FormField
                  control={form.control}
                  name={`plans.${index}.isActive`}
                  render={({ field }) => (
                     <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                     <FormLabel>Active</FormLabel>
                     <FormControl>
                        <Switch
                           checked={plan.isActive}
                           onCheckedChange={(checked) => updatePlan(index, 'isActive', checked)}
                        />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />
               </div>
            </div>
         ))}
         
         {plans.length === 0 && (
            <div className="text-center py-8 text-gray-500">
               <p>No plans added yet. Click "Add Plan" to create your first service plan.</p>
            </div>
         )}
         </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-4 mt-8">
            <FormField
               control={form.control}
               name="agreements"
               render={() => (
                  <FormItem>
                  <FormLabel className="font-medium">Attach Agreements *</FormLabel>
                  
                     {agreement.map(a => (
                        <FormField
                           key={a.id}
                           control={form.control}
                           name="agreements"
                           render={({ field }) => {
                           return (
                              <FormItem
                                 key={a.id}
                                 className="flex flex-row items-center gap-2 flex-1"
                              >
                                 <FormControl>
                                    <Checkbox
                                       checked={field.value?.includes(a.id)}
                                       onCheckedChange={(checked) => {
                                          return checked
                                          ? field.onChange([...field.value, a.id])
                                          : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== a.id
                                                )
                                             )
                                       }}
                                    />
                                 </FormControl>
                                 <FormLabel className="text-sm font-normal">{a.name}{" "} | Version: {a.version} | Date {formatDateWithTime(a.createdAt)}</FormLabel>
                              </FormItem>
                              )
                        }}
                     />
                  ))}
                  <FormMessage />
                  </FormItem>
               )}
            />

            <Button type="submit" className="w-full">
               Save
            </Button>
        </div>
      </form>
    </Form>
  );
}

export default ServiceEditForm;
