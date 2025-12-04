'use client';
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, extractFileKeyFromUrl, generateUniqueS3FileKey } from "@/lib/utils";
import { deleteS3File, getS3UploadUrl } from "@/actions/aws-s3";
import { toast } from "sonner";
import { File, X } from "lucide-react";
import Link from "next/link";
import { updatePortfolioReviewFile } from "@/actions/portfolio-review-fileUpload";
import { useRouter } from "next/navigation";
import { ServicePlan, UserRiskProfile } from "@/prisma/generated/client";
import UserRiskProfileQuestions from "./userRiskProfileForm";

export default function PortfolioReviewFileUpload({
  prevFileUrl,
  prevFileName,
  userPurchasedServiceId,
  plan,
  className,
  riskProfile
}: {
  prevFileUrl?: string | null;
  prevFileName?: string | null;
  plan: ServicePlan | null; 
  userPurchasedServiceId: string | undefined;
  className?: string;
  riskProfile: UserRiskProfile | null;
}) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFileTypes = [".pdf", ".doc", ".docx", ".xlsx", ".xls"];

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!allowedFileTypes.includes(`.${fileExtension}`)) {
      toast.error("Unsupported file type. Please upload a valid file.");
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if(riskProfile === null){
      toast.error("Please complete the risk profiling questionnaire before uploading your stocks.",{
        duration: 15000,
        action:{
          label: "Complete Now",
          onClick: () => {
            router.push('/profile');
          }
        }
      });
      
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    if (!userPurchasedServiceId) {
       toast.error("No service found for this user.");
       return;
    }

    setUploading(true);

    try {
      const fileKey = generateUniqueS3FileKey(selectedFile.name, "portfolio-review");
      const uploadUrl = await getS3UploadUrl(fileKey, selectedFile.type, 300, selectedFile.name);

      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
           "Content-Disposition": `attachment; filename="${selectedFile.name}"`
        },
      });

      if (!res.ok) throw new Error("Failed to upload file.");

      const result = await updatePortfolioReviewFile({
         userPurchasedServiceId,
         uploadedFileName: selectedFile.name,
         uploadedFileUrl: uploadUrl.split("?")[0], // Get the URL without query params
      })
      if (!result.success) throw new Error(result.error || "Failed to update portfolio review file.");
   

      toast.success("File uploaded successfully!");

      // Handle deletion of the previous file if `prevFileUrl` exists
      if (prevFileUrl) {
        try {
          await deleteS3File(extractFileKeyFromUrl(prevFileUrl));
          toast.success("Previous file deleted successfully.");
        } catch (err) {
          toast.error(`Failed to delete previous file: ${(err as Error).message}`);
        }
      }
      router.refresh(); // Refresh the page to reflect changes
    } catch (err) {
      toast.error(`Error during upload: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  }

return (
    <div
      className={cn(
        `flex flex-col md:flex-row items-end gap-8 p-4 border rounded-lg bg-neutral-100 dark:bg-neutral-800`,
        className
      )}
    >
         {!selectedFile && !prevFileUrl &&(
            <div className="w-full flex flex-col gap-2">
               <span className="font-medium">Up to {plan?.stockLimit ||'N/A'} are allowed</span>
               <div
                  className="min-h-32 relative rounded w-full border border-purple-400 px-6 py-4 border-dashed
                  flex flex-col items-center justify-center text-gray-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileChange({ target: { files: [file] } } as any);
                }}
                onDragOver={e => e.preventDefault()}
               >
                  <span className="text-base mb-4">Upload your stocks</span>
                  <span>Supported files</span>
                  <span className="text-xs text-gray-400">.pdf, .doc, .docx, .xlsx, .xls</span>
               </div>
               <input
                  id="fileInput"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  />
            </div>
         )}

      {selectedFile && (
        <div className="">
          <p className="text-sm text-gray-700">Selected Stocks File: </p>
          <div className="flex h-10 items-center gap-2 border rounded-sm  px-2 mt-2">
            <File size={64}/>
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <X
               onClick={() => setSelectedFile(null)} // Reset selected file
               className="w-full"
               size={16}
               style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      )}
      {prevFileUrl && (
        <div className="w-full">
          <p className="text-sm text-gray-700">Uploaded Stocks File: </p>
          <div className="flex h-10 items-center gap-2 border rounded-sm  px-2 mt-2">
            <File size={32}/>
            <span className="text-sm font-medium">{prevFileName}</span>
          </div>
        </div>
      )}
      <div className="flex gap-2 w-full">
         {prevFileUrl ? (
            <Button
               asChild
               className="w-full flex-1 h-10 border shadow-none"
               variant={'secondary'}
            >
               <Link
                  href={prevFileUrl}
                  rel="noopener noreferrer"
                  className="hover:!text-legacisGreen"
               >
                  Download Uploaded File
               </Link>
            </Button>
         ):(

         <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full flex-1 h-10 border shadow-none"
            variant={'secondary'}
            >
            {uploading ? "Uploading..." : "Upload File"}
         </Button>
         )}
      </div>

    </div>
  );
}