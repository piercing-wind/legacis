'use client';

import { Blog, BlogStatus } from "@/prisma/generated/client";
import { useForm } from "react-hook-form";
import { set, z } from "zod";
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
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { createBlog, deleteBlog } from "@/actions/admin/blog";
import { useRouter } from "next/navigation";
import { deleteS3File, getS3UploadUrl } from "@/actions/aws-s3";
import Image from "next/image";
import { extractFileKeyFromUrl, generateUniqueS3FileKey } from "@/lib/utils";
import { blogSchema } from "@/lib/schema";
import { BlogFormValues } from "@/lib/schema";
const QuillRenderPage = dynamic(() => import("../quill"), { ssr: false });


function BlogForm({ blog }: { blog?: Blog | null }) {
   const router = useRouter();
   const [quillInstance, setQuillInstance] = useState<any>(null);
   const [uploading, setUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
   const [saving, setSaving] = useState(false);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: blog
      ? {
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt ?? "",
          content: blog.content
            ? typeof blog.content === "string"
               ? blog.content
               : JSON.stringify(blog.content)
            : "",
          featuredImage: blog.featuredImage?? '/placeholder.png',
          category: blog.category?.join(", ") ?? "",
          status: blog.status,
          featured: blog.featured ?? false,
          published: blog.published ?? false,
        }
      : {
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          featuredImage: "",
          category: "",
          status: "DRAFT",
          featured: false,
          published: false,
        },
  });
  
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploading(true);
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalImagePreview(URL.createObjectURL(file));
    try {
       const fileKey = generateUniqueS3FileKey(file.name, 'blog'); 
       
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
         
         form.setValue("featuredImage", `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${fileKey}`);
         toast.success("Image uploaded!");

         if(blog?.featuredImage) {
             const res = await deleteS3File(extractFileKeyFromUrl(blog.featuredImage))
         }
    } catch (err) {
      toast.error(`${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  
  async function onSubmit(values: BlogFormValues) {
    try {
      setSaving(true);
      const res = await createBlog(values);
      if(!res.success) throw new Error(res.error);

      toast.success("Blog saved successfully!",{
         action: {
             label: "View",
             onClick: () => router.push(`/blog/${res.blog!.slug}`),
         },
         duration: 30000,
      });
      setSaving(false);
      router.refresh();
    } catch (error) {
      toast.error(`Failed to save blog: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

  }

   async function handleDelete() {
      if (!blog?.id) return;
      if (!confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return;
      const res = await deleteBlog(blog.id);
      if (res.success) {
         toast.success("Blog deleted.");
         router.push("/admin/blog"); // Change to your blogs list route
         router.refresh();
      } else {
         toast.error(res.error || "Failed to delete blog.");
      }
   }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
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
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Quill Editor for Content */}

        <FormField
          control={form.control}
          name="featuredImage"
          render={({ field }) => (
            <FormItem className="space-y-2 mt-14">
              <FormLabel>Featured Image *</FormLabel>
              <FormControl>
               <div className="mb-4">
                  <div className="mb-2 relative aspect-video w-full rounded-lg overflow-clip border">
                    {localImagePreview ? (
                        <Image 
                           src={localImagePreview || "/placeholder.png"} 
                           alt="Featured" 
                           className="h-24 rounded object-cover" 
                           fill
                        />
                     ):(
                        <Image 
                           src={blog?.featuredImage || "/placeholder.png"} 
                           alt="Featured" 
                           className="h-24 rounded object-cover" 
                           fill
                           unoptimized
                        />
                     )}
                   {uploading && <div className="z-10 inset-0 absolute bg-neutral-800/50 text-lg flex items-center justify-center !text-white text-center">Uploading...</div>}
                  </div>
                  <Input 
                     type='file'
                     accept="image/*"
                     ref={fileInputRef}
                     onChange={handleFileChange}
                     disabled={uploading}
                     className="border rounded-xl h-10 cursor-pointer"
                  />
               </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories (comma separated)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(BlogStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
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
            name="featured"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Published</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
      </div>
      <div>
         <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <FormControl>
                <div className="w-full min-h-[80vh] mb-14">
                  <QuillRenderPage
                     defaultValue={
                        typeof blog?.content === "string"
                           ? JSON.parse(blog.content)
                           : blog?.content
                     }
                     enableImageUpload
                     onQuillReady={(quill: any) => {
                     setQuillInstance(quill);
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
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Saving ...' : 'Save Blog'}
        </Button>
        {blog?.id && (
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
          >
            Delete Blog
          </Button>
        )}
      </div>
      </form>
    </Form>
  );
}

export default BlogForm;