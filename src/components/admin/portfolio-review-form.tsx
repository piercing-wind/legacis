"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "../ui/form";
import { useRouter } from "next/navigation";
import { PortfolioReview, PortfolioReviewStatus, UserPurchasedServices } from "@/prisma/generated/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { extractFileKeyFromUrl, generateUniqueS3FileKey } from "@/lib/utils";
import { deleteS3File, getS3UploadUrl } from "@/actions/aws-s3";
import { 
  updatePortfolioReviewStatus,
  updatePortfolioReviewFile,
  deleteUserUploadedFile,
  deleteReviewedFile
} from "@/actions/admin/portfolio-review";
import Link from "next/link";

// Define schema for validation
const PortfolioReviewSchema = z.object({
  status: z.nativeEnum(PortfolioReviewStatus),
  reviewedFile: z.instanceof(File).optional(),
});

// Define TypeScript type for form data
type PortfolioReviewFormData = z.infer<typeof PortfolioReviewSchema>;

interface AdminPortfolioReviewFormProps {
  portfolioReview: PortfolioReview & {
    userPurchasedService: UserPurchasedServices & {
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    };
  };
}

export default function AdminPortfolioReviewForm({
  portfolioReview,
}: AdminPortfolioReviewFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<PortfolioReviewFormData>({
    resolver: zodResolver(PortfolioReviewSchema),
    defaultValues: {
      status: portfolioReview.status || PortfolioReviewStatus.PENDING_UPLOAD,
      reviewedFile: undefined,
    },
  });

  const onSubmit: SubmitHandler<PortfolioReviewFormData> = async (data) => {
    setUploading(true);

    try {
      let uploadedFileUrl = portfolioReview.reviewedFileUrl;
      let uploadedFileName = portfolioReview.reviewedFileName;

      // Handle file upload if a new file is selected
      if (data.reviewedFile) {
        const fileKey = generateUniqueS3FileKey(data.reviewedFile.name, "portfolio-review");
        const uploadUrl = await getS3UploadUrl(fileKey, data.reviewedFile.type, 300, data.reviewedFile.name);

        const res = await fetch(uploadUrl, {
          method: "PUT",
          body: data.reviewedFile,
          headers: {
            "Content-Type": data.reviewedFile.type,
            "Content-Disposition": `attachment; filename="${data.reviewedFile.name}"`  
          },
        });

        if (!res.ok) throw new Error("Failed to upload file to S3.");

        uploadedFileUrl = uploadUrl.split("?")[0]; // Get the URL without query params
        uploadedFileName = data.reviewedFile.name;

        // Delete previous reviewed file if it exists
        if (portfolioReview.reviewedFileUrl) {
          try {
            await deleteS3File(extractFileKeyFromUrl(portfolioReview.reviewedFileUrl));
          } catch (err) {
            console.error("Failed to delete previous file:", err);
            // Don't show error to user, just log it
          }
        }

        // Update the portfolio review with new file info
        const fileResult = await updatePortfolioReviewFile(
          portfolioReview.id,
          portfolioReview.userPurchasedService.id,
          uploadedFileUrl,
          uploadedFileName
        );

        if (!fileResult.success) {
          throw new Error(fileResult.error || "Failed to update portfolio review file.");
        }
      }

      // Update status if it's different from current
      if (data.status !== portfolioReview.status) {
        const statusResult = await updatePortfolioReviewStatus(
          portfolioReview.id,
          data.status
        );

        if (!statusResult.success) {
          throw new Error(statusResult.error || "Failed to update portfolio review status.");
        }
      }

      toast.success("Portfolio review updated successfully!");
      router.refresh();

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Error: ${(error as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUserFile = async () => {
    setDeleting(true);
    try {
      const result = await deleteUserUploadedFile(portfolioReview.id);
      
      if (result.success) {
        toast.success("User uploaded file deleted successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete user file");
      }
    } catch (error) {
      console.error("Error deleting user file:", error);
      toast.error("Error deleting user file");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteReviewedFile = async () => {
    setDeleting(true);
    try {
      const result = await deleteReviewedFile(portfolioReview.id);
      
      if (result.success) {
        toast.success("Reviewed file deleted successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete reviewed file");
      }
    } catch (error) {
      console.error("Error deleting reviewed file:", error);
      toast.error("Error deleting reviewed file");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Review Information */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Portfolio Review Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="font-medium">For : {portfolioReview.userPurchasedService.user.name}</span> 
            <span className="font-medium">Email: {portfolioReview.userPurchasedService.user.email}</span> 
          </div>
          <div>
            <span className="font-medium">Current Status:</span> {portfolioReview.status.replace(/_/g, ' ')}
          </div>
          {portfolioReview.uploadedFileName && (
            <div className="flex items-center gap-2">
               <Button asChild variant="outline" size="sm">
                  <Link 
                     href={portfolioReview.uploadedFileUrl || "#"}
                     target="_blank"
                  >
                     {portfolioReview.uploadedFileName}
                  </Link>
               </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteUserFile}
                disabled={uploading || deleting}
                size={"sm"}
              >
                {deleting ? "Deleting..." : "Delete User File"}
              </Button>
            </div>
          )}
          {portfolioReview.reviewedFileName && (
            <div>
              <span className="font-medium">Reviewed File:</span> {portfolioReview.reviewedFileName}
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Update Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(PortfolioReviewStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Set the current status of the portfolio review.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reviewedFile"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Upload Reviewed File</FormLabel>
                <FormControl>
                  <Input 
                    {...fieldProps}
                    type="file" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload the reviewed file for the portfolio.
                  {portfolioReview.reviewedFileName && (
                    <span className="block text-sm text-muted-foreground mt-1">
                      Current file: {portfolioReview.reviewedFileName}
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 flex-wrap">
            <Button type="submit" disabled={uploading || deleting}>
              {uploading ? "Updating..." : "Update Review"}
            </Button>



            {portfolioReview.reviewedFileName && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteReviewedFile}
                disabled={uploading || deleting}
              >
                {deleting ? "Deleting..." : "Delete Reviewed File"}
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* File Download Links */}
      {(portfolioReview.reviewedFileUrl || portfolioReview.reviewedFileUrl) && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Download Files</h3>
          <div className="flex gap-4">
            {portfolioReview.reviewedFileUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={portfolioReview.reviewedFileUrl} target="_blank" rel="noopener noreferrer">
                  Download User File
                </a>
              </Button>
            )}
            {portfolioReview.reviewedFileUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={portfolioReview.reviewedFileUrl} target="_blank" rel="noopener noreferrer">
                  Download Reviewed File
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}