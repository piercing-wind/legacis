"use client"

import { memo, useEffect, useRef, useMemo } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import Delta from "quill-delta";
import type Toolbar from "quill/modules/toolbar";
import { toast } from "sonner";
import { extractFileKeyFromUrl, generateUniqueS3FileKey } from "@/lib/utils";
import { deleteS3File, getS3UploadUrl } from "@/actions/aws-s3";

const QuillRenderPage = memo(
   ({ onQuillReady, 
      defaultValue,
      enableImageUpload = false,
   }: { 
    onQuillReady?: (quill: Quill) => void } & {
    defaultValue?: string | { ops: any[] };
    enableImageUpload?: boolean;
   }) => {

   const quill = useRef<Quill | null>(null);
   const editorRef = useRef<HTMLDivElement>(null);

   const toolbarOptions = useMemo(() => {
     const base = [
       ["bold", "italic", "underline", "strike"],
       ["blockquote", "code-block"],
       [{ header: 1 }, { header: 2 }],
       [{ list: "ordered" }, { list: "bullet" }],
       [{ script: "sub" }, { script: "super" }],
       [{ indent: "-1" }, { indent: "+1" }],
       [{ direction: ["ltr"] }],
       [{ size: ["small", false, "large", "huge"] }],
       [{ header: [1, 2, 3, 4, 5, 6, false] }],
       [{ color: [] }, { background: [] }],
       [{ font: [] }],
       [{ align: [] }],
       ["clean"],
     ];
     if (enableImageUpload) {
       base.splice(1, 0, ["image"]); // Add image after first row
     }
     return base;
   }, [enableImageUpload]);

  useEffect(() => {
    if (editorRef.current && !quill.current) {
      quill.current = new Quill(editorRef.current, {
        modules: {
          toolbar: toolbarOptions,
          history: {
            delay: 2000,
            maxStack: 200,
          },
        },
        placeholder: "Type here ...",
        theme: "snow",
      });
      quill.current.root.setAttribute("dir", "ltr");
      quill.current.format("direction", "ltr");
      if (onQuillReady) {
        onQuillReady(quill.current);
      }
      // -- Image Delete Handler --
      let previousContents = quill.current.getContents();

      quill.current.on("text-change", async (delta, oldDelta, source) => {
      const oldImages = previousContents.ops
         .filter((op: any) => op.insert && op.insert.image)
         .map((op: any) => op.insert.image);
      const newContents = quill.current!.getContents();
      const newImages = newContents.ops
         .filter((op: any) => op.insert && op.insert.image)
         .map((op: any) => op.insert.image);

      const removedImages = oldImages.filter((img) => !newImages.includes(img));

      for (const imageUrl of removedImages) {
         try {
            const fileKey = extractFileKeyFromUrl(imageUrl);
            await deleteS3File(fileKey);
            toast.success("Image deleted");
         } catch (error) {
            toast.error(`Failed to delete image: ${(error as Error).message}`);
         }
      }

      previousContents = newContents;
      })


      // --Image upload Handler--
      if(enableImageUpload) {
         const toolbar = quill.current.getModule('toolbar') as Toolbar;
         toolbar.addHandler('image', async()=>{
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
               const file = input.files?.[0]
               if(!file) return

               try {
                  const fileKey = generateUniqueS3FileKey(file.name, "blog");
                  const uploadUrl = await getS3UploadUrl(fileKey, file.type, 300, file.name);
                  const res = await fetch (uploadUrl, {
                     method : 'PUT',
                     body : file,
                     headers : {
                        'Content-Type' : file.type,
                        'Content-Disposition': `attachment; filename="${file.name}"`
                     },
                  });
                  if(!res.ok) throw new Error('Failed to upload image');
                  const s3Url = `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${fileKey}`;
                  
                  const range = quill.current!.getSelection(true);
                  quill.current!.insertEmbed(range.index, 'image', s3Url);
      
               } catch (error) {
                  toast.error(`${(error as Error).message}`)
               };

            }

         })
      }

    }
  }, [onQuillReady, toolbarOptions, enableImageUpload]);

      
   useEffect(() => {
   if (quill.current) {
      let delta;
      try {
         if (!defaultValue) {
         // Use Quill's Delta class for empty content
         delta = new Delta();
         } else if (typeof defaultValue === "string") {
         delta = JSON.parse(defaultValue);
         if (!delta || typeof delta !== "object" || !Array.isArray(delta.ops)) {
            delta = new Delta();
         }
         } else if (typeof defaultValue === "object" && Array.isArray(defaultValue.ops)) {
         delta = defaultValue;
         } else {
         delta = new Delta();
         }
         quill.current.setContents(delta);
      } catch {
         quill.current.setContents(new Delta());
      }
   }
   }, [defaultValue]);
    
  return (
    <div className="flex flex-col w-full h-full">
      <div
        ref={editorRef}
        style={{
          minHeight: "100%",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
          direction: "ltr", // Ensure LTR direction
        }}
        className="w-full"
      />
    </div>
  );
});

QuillRenderPage.displayName = "QuillRenderPage";
export default QuillRenderPage;