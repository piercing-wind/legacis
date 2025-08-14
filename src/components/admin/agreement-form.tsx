'use client';

import { Agreement, AgreementType, PolicyType } from "@/prisma/generated/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { upsertAgreement, deletePolicy } from "@/actions/admin/agreement";
import { useRouter } from "next/navigation";
import { agreementSchema } from "@/lib/schema";
import { AgreementFormValues } from "@/lib/schema";
const QuillRenderPage = dynamic(() => import("../quill"), { ssr: false });


function AgreementForm({ agreement }: { agreement?: Agreement | null }) {
   const router = useRouter();
   const [saving, setSaving] = useState(false);

   const form = useForm<AgreementFormValues>({
      resolver: zodResolver(agreementSchema),
      defaultValues: agreement
         ? {
            id: agreement.id,
            name: agreement.name,
            // Convert content to string for the form
            content:
               typeof agreement.content === "string"
                  ? agreement.content
                  : agreement.content
                  ? JSON.stringify(agreement.content)
                  : "",
            type: agreement.type,
            policyType: agreement.policyType || null,
            signatoryPerson: agreement.signatoryPerson || "",
            companyName: agreement.companyName || "",
            }
         : {
            name: "",
            content: "",
            type: AgreementType.AGREEMENT,
            policyType: null,
            signatoryPerson: "",
            companyName: "",
         },
   });
   const typeOfContent = form.watch("type");

   async function onSubmit(values: AgreementFormValues) {
      setSaving(true);
      const res = await upsertAgreement({ ...values, id: agreement?.id });
      if (res.success) {
         toast.success("Agreement saved!");
         router.refresh();
      } else {
         toast.error("Failed: " + (res.error?.toString() ?? "Unknown error"));
      }
      setSaving(false);
   }

   async function handleDelete() {
      if (!agreement?.id) return;
      if (!confirm("Are you sure you want to delete this agreement?")) return;
      if (agreement.type === AgreementType.AGREEMENT) {
         toast.error("You cannot delete a standard agreement.");
         return;
      }
      const res = await deletePolicy(agreement.id);
      if (res.success) {
         toast.success("Agreement deleted.");
         router.push("/admin/agreements");
         router.refresh();
      } else {
         toast.error(res.error || "Failed to delete agreement.");
      }
   }


   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
               <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                  <FormItem>
                     <FormLabel>Name *</FormLabel>
                     <FormControl>
                        <Input {...field} />
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
                     <FormLabel>Type *</FormLabel>
                     <FormControl>
                        <Select 
                           value={field.value} 
                           onValueChange={field.onChange}
                           disabled={!!agreement?.id}
                        >
                        <SelectTrigger>
                           <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                           {Object.values(AgreementType).map((t) => (
                              <SelectItem key={t} value={t}>
                              {t}
                              </SelectItem>
                           ))}
                        </SelectContent>
                        </Select>
                     </FormControl>
                     <FormMessage />
                  </FormItem>
                  )}
               />
               {/* Show policyType only if type is POLICY */}
               {form.watch("type") === AgreementType.POLICY && (
                  <FormField
                  control={form.control}
                  name="policyType"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Policy Type *</FormLabel>
                        <FormControl>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                           <SelectTrigger>
                              <SelectValue placeholder="Select policy type" />
                           </SelectTrigger>
                           <SelectContent>
                              {Object.values(PolicyType).map((t) => (
                              <SelectItem key={t} value={t}>
                                 {t}
                              </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
                  />
               )}
               <FormField
                  control={form.control}
                  name="signatoryPerson"
                  render={({ field }) => (
                  <FormItem>
                     <FormLabel>Signatory Person</FormLabel>
                     <FormControl>
                        <Input 
                           {...field} 
                           value={field.value || ""}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                  <FormItem>
                     <FormLabel>Company Name</FormLabel>
                     <FormControl>
                        <Input 
                        {...field} 
                        value={field.value || ""}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
                  )}
               />
            </div>
            <div className="col-span-2">
               <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                  <FormItem>
                     <FormLabel>Content *</FormLabel>
                     <FormControl>
                        <div className="w-full min-h-[80vh]">
                           <QuillRenderPage
                              defaultValue={agreement?.content}
                              onQuillReady={(quill: any) => {
                                 quill.on("text-change", () => {
                                    form.setValue("content", JSON.stringify(quill.getContents()));
                                 });
                              }}
                              
                           />
                        </div>
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
            </div>
            <div className="flex flex-col gap-2 items-center">
               <Button type="submit" disabled={saving} className="w-full">
                  {saving ? 'Saving ...' : typeOfContent === "AGREEMENT" ? 'Create New Agreement' : 'Update Policy'}
               </Button>
               {agreement?.id && typeOfContent !== "AGREEMENT" && (
                  <Button
                     type="button"
                     variant="destructive"
                     className="w-full"
                     onClick={handleDelete}
                     >
                     Delete Policy
                  </Button>
               )}
            </div>
         </form>
      </Form>
   );
}

export default AgreementForm;