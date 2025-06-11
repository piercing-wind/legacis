'use client'
import { useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { toast } from "sonner";


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();



export const PDFDisplay = ({ fileUrl }: { fileUrl: string }) => {
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pageNum, setPageNum] = useState(0);

  return (
    <Document
      loading={
        <div className=" flex items-center justify-center h-screen">
          Loading...
        </div>
      }
      onLoadError={(error) => {
        toast.error(`Failed to load Document`, {
          duration: 15000,
          action: {
            label: "Close",
            onClick: () => toast.dismiss(),
          },
          description: `${(error as Error).message}`,
        });
      }}
      onLoadSuccess={({ numPages }) => {
        setPageNum(numPages);
      }}
      file={fileUrl}
      className="max-h-full space-y-2 "
    >
      {new Array(pageNum).fill(0).map((_, i) => (
        <div
          ref={(ref) => {
            pageRefs.current[i] = ref;
          }}
          key={i}
          className="relative rounded"
        >
          <div className="absolute bg-slate-600 px-1 text-xs rounded-sm top-4 left-5 z-10 text-white">
            {i + 1}
          </div>
          <Page pageNumber={i + 1} />
        </div>
      ))}
    </Document>
  );
};
