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
      // Match columns to the server export for consistency
      const excelData = data.map((purchase, index) => ({
         'S.No': index + 1,
         'User Name': purchase.user?.name || 'N/A',
         'User Email': purchase.user?.email || 'N/A',
         'User Phone': purchase.user?.phone || 'N/A',
         'Service Name': purchase.service?.name || 'N/A',
         'Service Type': purchase.service?.type?.replace(/_/g, ' ') || 'N/A',
         'Grant Type': purchase.grantType?.replace(/_/g, ' ') || 'N/A',
         'Plan': purchase.plan || purchase.servicePlan?.label || '',
         'Plan Days': purchase.planDays || purchase.servicePlan?.durationInDays || '',
         'Purchase Date': purchase.purchaseDate ? formatHumanDate(purchase.purchaseDate) : '',
         'Expiry Date': purchase.expiryDate ? formatHumanDate(purchase.expiryDate) : '',
         'Status': purchase.isActive ? 'Active' : 'Expired',
         'Order ID': purchase.orderId || purchase.transaction?.orderId || '',
         'Amount Paid (₹)': purchase.amountPaid || purchase.transaction?.amount || '',
         'Coupon Used': purchase.couponUsed?.code || purchase.transaction?.coupon?.code || '',
         'Discount %': purchase.discount || purchase.couponUsed?.percentOff || purchase.transaction?.coupon?.percentOff || '',
         'Grant Reason': purchase.grantReason || '',
         'Parent Service (main)': purchase.parentServiceId || '',
         'Subscription ID': purchase.id || '',
         'Granted By (Admin ID)': purchase.grantedBy || '',
         'Transaction ID': purchase.transactionId || purchase.transaction?.id || '',
         'Payment ID': purchase.paymentId || purchase.transaction?.paymentId || '',
         'Payment Gateway': purchase.paymentGateway || purchase.transaction?.paymentGateway || '',
         'Currency': purchase.currency || purchase.transaction?.currency || '',
         'Created At': formatHumanDate(purchase.createdAt),
         'Coupon Description': purchase.couponDescription || purchase.transaction?.coupon?.description || '',
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths to match server export
      ws['!cols'] = [
         { wch: 8 },   // S.No
         { wch: 20 },  // User Name
         { wch: 25 },  // User Email
         { wch: 18 },  // User Phone
         { wch: 20 },  // Service Name
         { wch: 18 },  // Service Type
         { wch: 15 },  // Grant Type
         { wch: 14 },  // Plan
         { wch: 12 },  // Plan Days
         { wch: 18 },  // Purchase Date
         { wch: 18 },  // Expiry Date
         { wch: 12 },  // Status
         { wch: 18 },  // Order ID
         { wch: 16 },  // Amount Paid
         { wch: 16 },  // Coupon Used
         { wch: 12 },  // Discount %
         { wch: 20 },  // Grant Reason
         { wch: 20 },  // Parent Service (main)
         { wch: 36 },  // Subscription ID
         { wch: 24 },  // Granted By (Admin ID)
         { wch: 36 },  // Transaction ID
         { wch: 24 },  // Payment ID
         { wch: 18 },  // Payment Gateway
         { wch: 10 },  // Currency
         { wch: 18 },  // Created At
         { wch: 24 },  // Coupon Description
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions');
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `subscriptions_export_${currentDate}.xlsx`;
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