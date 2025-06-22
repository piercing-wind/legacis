'use client'
import { useRef, useState, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageNum, setPageNum] = useState(0);
  const [pageWidth, setPageWidth] = useState<number>();

  // Calculate page width based on container size
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Set width with some padding for mobile/tablet
        const width = Math.min(containerWidth - 32, 1024); // Max 800px, min container - padding
        setPageWidth(width);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full max-h-[80vh] overflow-auto"
    >
      <Document
        loading={
          <div className="flex items-center justify-center h-64 text-sm text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-platina"></div>
              <span>Loading PDF...</span>
            </div>
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
        className="w-full"
      >
        <div className="space-y-4 p-4">
          {new Array(pageNum).fill(0).map((_, i) => (
            <div
              ref={(ref) => {
                pageRefs.current[i] = ref;
              }}
              key={i}
              className="relative w-full flex justify-center"
            >
              {/* Page Number Badge */}
              <div className="absolute bg-gray-800/80 backdrop-blur-sm px-2 py-1 text-xs rounded-md top-2 left-2 z-10 text-white font-medium shadow-lg">
                {i + 1} / {pageNum}
              </div>
              
              {/* PDF Page */}
              <div className="shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white">
                <Page 
                  pageNumber={i + 1}
                  width={pageWidth}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="max-w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </Document>
    </div>
  );
};