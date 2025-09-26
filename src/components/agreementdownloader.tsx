"use client";
import React from "react";
import { Download } from "lucide-react";
import { formatDateWithTime } from "@/lib/utils";
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { AgreementSummary } from "@/types/global";
import { toast } from "sonner";
import { Button } from "./ui/button";

export const AgreementPdfDownload: React.FC<{
  contentRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
  agreementData?: any; // Add agreement data prop
  agreementSummary?: AgreementSummary; // Add agreement summary prop
  agreementAcceptedAt?: Date | null; // Add agreement accepted date prop
}> = ({ contentRef, filename = "agreement", agreementData, agreementSummary, agreementAcceptedAt }) => {
   const [isDownloaded, setIsDownloaded] = React.useState(false);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) {
      return;
    }
    setIsDownloaded(true);
    try {
      
      // Create clean HTML for PDF generation
      const cleanHtml = createCleanHtml(contentRef.current);
      
      // Create complete HTML document with proper CSS for PDF
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agreement PDF</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            /* Force consistent rendering across all devices */
            html {
              width: 210mm; /* A4 width */
              height: auto;
              font-size: 16px; /* Base font size */
            }
            
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              background: #ffffff;
              font-size: 14px;
              padding: 0;
              margin: 0;
              width: 210mm; /* A4 width */
              min-height: 297mm; /* A4 height */
              /* Force desktop-like rendering */
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
            
            .container {
              width: 100%;
              max-width: 210mm; /* A4 width */
              padding: 0;
              margin: 0 auto;
            }
            
            h1, h2, h3, h4, h5, h6 {
              margin-bottom: 15px;
              font-weight: bold;
              /* Fixed font sizes for consistency */
            }
            
            h1 {
              font-size: 28px;
              color: #1c1c1c;
            }
            
            h2 {
              font-size: 18px;
              color: #1c1c1c;
              border-bottom: 1px solid #d1c4e9;
              padding-bottom: 8px;
            }
            
            h3 {
              font-size: 16px;
              color: #1c1c1c;
            }
            
            h4 {
              font-size: 14px;
              color: #1c1c1c;
            }
            
            p {
              margin-bottom: 12px;
              font-size: 14px;
              line-height: 1.6;
            }
            
            /* Force table to maintain consistent layout */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              table-layout: fixed; /* Force consistent table layout */
            }
            
            td, th {
              padding: 12px;
              border: 1px solid #e0e0e0;
              text-align: left;
              vertical-align: top;
              font-size: 14px;
              word-wrap: break-word;
            }
            
            .signature-section {
              margin-top: 50px;
              padding-top: 30px;
              border-top: 2px solid #cccccc;
              page-break-inside: avoid;
            }
            
            .signature-container {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
              width: 100%;
            }
            
            .signature-box {
              width: 45%;
              padding: 20px;
              min-height: 120px; /* Ensure consistent height */
            }
            
            .accepted-status {
              color: #16a34a;
              font-weight: bold;
            }
            
            /* Service details styling */
            .no-page-break {
              page-break-inside: avoid;
            }
            
            /* Ensure consistent text rendering */
            .pdf-content {
              font-size: 14px;
              line-height: 1.6;
            }
            
            /* Force consistent list styling if any */
            ul, ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            
            li {
              margin-bottom: 5px;
              font-size: 14px;
            }
            
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              
              .page-break {
                page-break-before: always;
              }
              
              .no-page-break {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${cleanHtml}
          </div>  
        </body>
        </html>
      `;
      
      // Send HTML to API route for PDF generation
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: fullHtml,
          filename: filename
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the PDF blob and download it
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      
    } catch (error) {
      toast.error(`Failed to generate PDF. Please try again or contact support. ${error}`);
    }
  };

  const createCleanHtml = (element: HTMLElement): string => {
    // Helper function to strip colors from delta (same as QuillHtmlViewer)
    const stripColorsFromDelta = (delta: any) => {
      if (!delta || !Array.isArray(delta.ops)) return delta;
      return {
        ...delta,
        ops: delta.ops.map((op: any) => {
          if (op.attributes && (op.attributes.color || op.attributes.background)) {
            const { color, background, ...rest } = op.attributes;
            return { ...op, attributes: { ...rest } };
          }
          return op;
        }),
      };
    };

    // Extract all text and create properly formatted structure using QuillHtmlViewer logic
    const title = 'Service Agreement';
    
    // Get agreement sections with proper Quill formatting
    const agreementSections: { title: string; content: string }[] = [];
    
    // If we have agreement data, use it to generate proper HTML
    if (agreementData && agreementData.length > 0) {
      agreementData.forEach((agreement: any) => {
        let delta: any = agreement.content;
        if (typeof delta === "string") {
          try {
            delta = JSON.parse(delta);
          } catch {
            delta = { ops: [{ insert: agreement.content }] };
          }
        }
        
        const cleanedDelta = stripColorsFromDelta(delta);
        let html = '';
        try {
          const converter = new QuillDeltaToHtmlConverter(cleanedDelta.ops, {});
          html = converter.convert();
        } catch {
          html = typeof cleanedDelta === 'string' ? cleanedDelta : '';
        }
        
        agreementSections.push({ 
          title: agreement.name || 'Agreement', 
          content: html 
        });
      });
    } else {
      // Fallback: extract from DOM if no agreement data
      const h2Elements = element.querySelectorAll('h2');
      h2Elements.forEach(h2 => {
        const sectionTitle = h2.textContent?.trim() || '';
        const nextElement = h2.nextElementSibling;
        if (nextElement) {
          const sectionContent = nextElement.innerHTML || '';
          if (sectionTitle && sectionContent) {
            agreementSections.push({ title: sectionTitle, content: sectionContent });
          }
        }
      });
    }

    // Use agreement summary data directly instead of DOM parsing
    const serviceDetails: { [key: string]: string } = {};
    if (agreementSummary) {
      if (agreementSummary.clientName) serviceDetails['Client Name'] = agreementSummary.clientName;
      if (agreementSummary.clientPhoneNumber) serviceDetails['Client Phone Number'] = agreementSummary.clientPhoneNumber;
      if (agreementSummary.clientpanNumber) serviceDetails['Client PAN Number'] = agreementSummary.clientpanNumber;
      if (agreementSummary.aadhaarNumber) serviceDetails['Client Aadhaar Number'] = agreementSummary.aadhaarNumber;
      if (agreementSummary.serviceName) serviceDetails['Service Name'] = agreementSummary.serviceName;
      if (agreementSummary.complimentaryServicesNames) serviceDetails['Complimentary Services'] = agreementSummary.complimentaryServicesNames;
      if (agreementSummary.subscriptionStartDate) serviceDetails['Subscription Start Date'] = agreementSummary.subscriptionStartDate;
      if (agreementSummary.subscriptionFrequency) serviceDetails['Subscription Frequency'] = agreementSummary.subscriptionFrequency;
      if (agreementSummary.subscriptionPrice) serviceDetails['Subscription Price'] = agreementSummary.subscriptionPrice;
      // Add agreement accepted date if available
      if (agreementAcceptedAt) {
        serviceDetails['Agreement Accepted On'] = formatDateWithTime(agreementAcceptedAt);
      }
    }

    // Use signature data from agreement props - exact same logic as richTextViewer.tsx
    const signatureAgreement = agreementData?.find(
      (agreement: any) => agreement.signatoryPerson || agreement.companyName
    );
    
    let companyName = signatureAgreement?.companyName || 'Legacis Financial Services';
    let signatoryPerson = signatureAgreement?.signatoryPerson || '';
    let clientName = agreementSummary?.clientName || '';
    
    // Build completely clean HTML from scratch with proper CSS classes for PDF
    let html = `
      <div class="pdf-content">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #6c2eb7;">
          <h1>${agreementSummary?.serviceName} ${title}</h1>
          <div style="color: #666666; font-size: 14px;">Agreement Downloaded on ${formatDateWithTime(new Date())}</div>
        </div>
    `;

    // Add agreement sections with proper Quill formatting and enhanced PDF styling
    agreementSections.forEach((section, index) => {
      // Escape title but keep content HTML for proper formatting
      const safeTitle = section.title.replace(/[<>&"']/g, '');
      
      html += `
        <div style="margin-bottom: 25px; ${index > 0 ? 'margin-top: 25px;' : ''}">
          <h2>${safeTitle}</h2>
          <div style="padding-left: 10px;">
            ${section.content}
          </div>
        </div>
      `;
    });

    // Add service details with better formatting for PDF
    if (Object.keys(serviceDetails).length > 0) {
      html += `
        <div class="no-page-break" style="margin-top: 40px; padding: 25px; background: #f8f4ff; border: 2px solid #d1c4e9; border-radius: 8px;">
          <h3 style="text-align: center; margin-bottom: 25px;">✓ Service Agreement Details</h3>
          <table>
      `;
      
      Object.entries(serviceDetails).forEach(([label, value]) => {
        // Escape special characters
        const safeLabel = label.replace(/[<>&"']/g, '');
        const safeValue = value.replace(/[<>&"']/g, '');
        
        html += `
          <tr>
            <td style="font-weight: 600; width: 40%;">${safeLabel}:</td>
            <td>${safeValue}</td>
          </tr>
        `;
      });
      
      html += `
          </table>
        </div>
      `;
    }

    // Add signature section with CSS classes
    const safeCompanyName = companyName.replace(/[<>&"']/g, '');
    const safeSignatoryPerson = signatoryPerson.replace(/[<>&"']/g, '');
    const safeClientName = clientName.replace(/[<>&"']/g, '');
    
   html += `
         <div class="signature-section">
         <div class="signature-container">
            <div class="signature-box company-signature">
               ${safeSignatoryPerson ? `<div style="font-size: 14px; margin-bottom: 5px;">${safeSignatoryPerson}</div>` : ''}
               <div style="font-size: 16px; font-weight: bold; padding-bottom: 8px; min-height: 25px;">${safeCompanyName}</div>
               <div style="margin-top: 10px; color: #888888; font-size: 11px;">Authorized Representative</div>
            </div>
            <div class="signature-box client-signature">
               <div style="margin-bottom: 8px; font-size: 14px;"><span class="accepted-status">✓</span> Agreement Accepted</div>
               <div style="font-size: 16px; font-weight: bold; padding-bottom: 8px; min-height: 25px;">${safeClientName || '[Client Name]'}</div>
               <div style="margin-top: 10px; color: #888888; font-size: 11px;">Digitally Signed on ${formatDateWithTime(agreementAcceptedAt!)} using Aadhaar OTP verification (UIDAI)</div>
            </div>
         </div>
         <div style="text-align: center; margin-top: 30px; color: #666666; font-size: 12px; padding: 15px; border-radius: 5px;">
            This agreement is digitally generated. 
         </div>
         </div>
      `;

    html += `</div>`;
    
    return html;
  };

  return (
    <Button
      variant="outline"
      className=""
      onClick={handleDownloadPDF}
      disabled={isDownloaded}
      type="button"
    >
      <Download size={16} />
      Download PDF
    </Button>
  );
};
