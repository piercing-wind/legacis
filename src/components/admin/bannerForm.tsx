'use client';

import { Banner } from "@/prisma/generated/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getS3UploadUrl, deleteS3File } from "@/actions/aws-s3";
import { extractFileKeyFromUrl, generateUniqueS3FileKey } from "@/lib/utils";
import { bannerSchema } from "@/lib/schema";
import { upsertBanner } from "@/actions/admin/banner";



type BannerFormValues = z.infer<typeof bannerSchema>;

export default function BannerForm({ banner }: { banner?: Banner | null }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: banner
      ? {
          id: banner.id,
          title: banner.title,
          text: banner.text,
          imageUrl: banner.imageUrl ?? "",
          buttonLabel: banner.buttonLabel,
          buttonUrl: banner.buttonUrl,
          bgColor: banner.bgColor ?? "",
          isActive: banner.isActive,
          startDate: banner.startDate?.toISOString().slice(0, 16) ?? "",
          endDate: banner.endDate?.toISOString().slice(0, 16) ?? "",
        }
      : {
          title: "",
          text: "",
          imageUrl: "",
          buttonLabel: "",
          buttonUrl: "",
          bgColor: "",
          isActive: true,
          startDate: "",
          endDate: "",
        },
  });

   async function handleRemoveImage() {
   const imageUrl = form.getValues("imageUrl");
   if (imageUrl && typeof imageUrl === "string") {
      try {
         setUploading(true);
         await deleteS3File(extractFileKeyFromUrl(imageUrl));
         form.setValue("imageUrl", "");
         setLocalImagePreview(null);
         toast.success("Image removed!");
      } catch (err) {
         toast.error("Failed to remove image");
      } finally {
         setUploading(false);
      }
   }
   }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploading(true);
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalImagePreview(URL.createObjectURL(file));
    try {
      const fileKey = generateUniqueS3FileKey(file.name, "banner");
      const uploadUrl = await getS3UploadUrl(fileKey, file.type, 300, file.name);

      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
          "Content-Disposition": `attachment; filename="${file.name}"`,
        },
      });
      if (!res.ok) throw new Error(`Failed to upload`);

      form.setValue("imageUrl", `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${fileKey}`);
      toast.success("Image uploaded!");

      if (banner?.imageUrl) {
        await deleteS3File(extractFileKeyFromUrl(banner.imageUrl));
      }
    } catch (err) {
      toast.error(`${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: BannerFormValues) {
    try {
      setSaving(true);
      const res = await upsertBanner(values);
      if(res.success === false) {
        toast.error(res.error);
        setSaving(false);
        return;
      }
      toast.success("Banner saved successfully!");
      setSaving(false);
      router.refresh();
    } catch (error) {
      toast.error(`Failed to save banner: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" gap-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="space-y-2 mt-8">
                <FormLabel>Banner Image (16:9)</FormLabel>
                <FormControl>
                  <div className="mb-4">
                    <div className="mb-2 relative aspect-video w-full rounded-lg overflow-clip border">
                      {localImagePreview ? (
                        <Image
                          src={localImagePreview}
                          alt="Banner"
                          className="h-24 rounded object-cover"
                          fill
                        />
                      ) : banner?.imageUrl ? (
                        <Image
                          src={banner.imageUrl}
                          alt="Banner"
                          className="h-24 rounded object-cover"
                          fill
                          unoptimized
                        />
                      ) : null}
                      {uploading && (
                        <div className="z-10 inset-0 absolute bg-neutral-800/50 text-lg flex items-center justify-center !text-white text-center">
                          Uploading...
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="border rounded-xl h-10 cursor-pointer"
                      />
                      {(form.getValues("imageUrl") || localImagePreview) && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleRemoveImage}
                          disabled={uploading}
                        >
                          Remove Image
                        </Button>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="buttonLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Label *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="buttonUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button URL *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         <FormField
         control={form.control}
         name="bgColor"
         render={({ field }) => (
            <FormItem>
               <FormLabel>Background Color</FormLabel>
               <FormControl>
               <div className="flex items-center gap-2">
                  <Input
                     type="text"
                     placeholder="#4aedb9"
                     {...field}
                     value={field.value || ""}
                     className="w-32"
                  />
                  <div
                     style={{
                     background: field.value || "#4aedb9",
                     width: 32,
                     height: 32,
                     borderRadius: 6,
                     border: "1px solid #ccc"
                     }}
                  />
               </div>
               </FormControl>
               <FormMessage />
            </FormItem>
         )}
         />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input 
                     type="datetime-local" {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input 
                     type="datetime-local" {...field} 
                     min={form.watch("startDate") || new Date().toISOString().slice(0, 16)}   
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-2 items-center justify-end mt-8">
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving ..." : "Save Banner"}
          </Button>
          {/* Add delete button if needed */}
        </div>
      </form>
    </Form>
  );
}