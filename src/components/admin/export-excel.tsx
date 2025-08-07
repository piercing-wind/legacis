'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from 'xlsx'
import { formatHumanDate } from "@/lib/utils"

interface ExportSubscriptionToExcelProps {
  data: any[]
}

export function ExportSubscriptionsToExcel({ data }: ExportSubscriptionToExcelProps) {
  const exportToExcel = () => {
    // Transform data for Excel export
    const excelData = data.map((purchase, index) => {
      const originalPrice = purchase.service?.price || 0;
      
      // Calculate amount based on grant type
      const getAmountValue = () => {
        switch (purchase.grantType) {
          case 'PURCHASED':
            return purchase.actualAmountPaid || Math.round((originalPrice * purchase.planDays / 30) * (1 - purchase.planDiscount / 100));
          case 'COMPLIMENTARY':
            return 0;
          case 'ADMIN_GRANTED':
            return purchase.grantMetadata?.finalPrice || purchase.grantMetadata?.pricing?.finalPrice || 0;
          default:
            return 0;
        }
      };

      const getPlanName = (days: number) => {
        if (days === 30) return "Monthly Plan"
        if (days === 90) return "Quarterly Plan (3 months)"
        if (days === 180) return "Half-Yearly Plan (6 months)"
        if (days === 360) return "Yearly Plan (12 months)"
        return `${days} Days Plan`
      };

      const getStatus = () => {
        if (!purchase.isActive) return 'Deactivated';
        return new Date(purchase.expiryDate) > new Date() ? 'Active' : 'Expired';
      };

      return {
        'S.No': index + 1,
        'User Name': purchase.user?.name || 'N/A',
        'User Email': purchase.user?.email || 'N/A',
        'Service Name': purchase.service?.name || 'N/A',
        'Service Type': purchase.service?.type?.replace(/_/g, ' ') || 'N/A',
        'Grant Type': purchase.grantType?.replace(/_/g, ' ') || 'N/A',
        'Plan': getPlanName(purchase.planDays),
        'Plan Days': purchase.planDays,
        'Purchase Date': formatHumanDate(purchase.purchaseDate),
        'Expiry Date': formatHumanDate(purchase.expiryDate),
        'Status': getStatus(),
        'Amount Paid (₹)': getAmountValue(),
        'Original Price (₹)': originalPrice,
        'Coupon Used': purchase.couponUsed?.code || 'None',
        'Discount %': purchase.couponUsed?.percentOff || purchase.planDiscount || 0,
        'Grant Reason': purchase.grantReason || 'N/A'
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 8 },   // S.No
      { wch: 20 },  // User Name
      { wch: 25 },  // User Email
      { wch: 25 },  // Service Name
      { wch: 18 },  // Service Type
      { wch: 15 },  // Grant Type
      { wch: 25 },  // Plan
      { wch: 10 },  // Plan Days
      { wch: 15 },  // Purchase Date
      { wch: 15 },  // Expiry Date
      { wch: 12 },  // Status
      { wch: 15 },  // Amount Paid
      { wch: 15 },  // Original Price
      { wch: 15 },  // Coupon Used
      { wch: 12 },  // Discount %
      { wch: 30 }   // Grant Reason
    ];
    
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `subscriptions_export_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };
  

    const handleExportAll = async () => {
      const res = await fetch("/api/admin/all-subscriptions", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({}), // You can send filters here if needed
      });

      if (!res.ok) {
         alert("Failed to export users.");
         return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Legacis_Users_Subscription_All.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
  };


  return (
   <div className="flex flex-col md:flex-row items-start gap-4">
      <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
         <Download className="w-4 h-4" />
         Export to Excel
      </Button>
      <Button onClick={handleExportAll} variant="outline" className="flex items-center gap-2">
         <Download className="w-4 h-4" />
         Export All to Excel
      </Button>

   </div>
  );
}