import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatDateWithTime } from "@/lib/utils";
import ExcelJS from "exceljs";


export const POST = auth(async (request) => {
   if (!request.auth) throw new Error("Unauthorized");
   const user = request.auth.user;

   if (!user || user.role !== 'ADMIN')  throw new Error("Admin access required");
 // 1. Get all user subscriptions (no filters, no pagination)
   const subscriptions = await db.userPurchasedServices.findMany({
   include: {
      user: { select: { name: true, email: true, phone: true } }, // Add phone
      service: { select: { name: true, type: true } },
      servicePlan: { select: { label: true, durationInDays: true, stockLimit: true } }, 
   },
   orderBy: { purchaseDate: "desc" },
   });


   
 // 2. Get all transactions for PURCHASED subscriptions
  const purchased = subscriptions.filter(s => s.grantType === 'PURCHASED');
  const transactions = await db.transaction.findMany({
    where: {
      userId: { in: purchased.map(s => s.userId) },
      serviceId: { in: purchased.map(s => s.serviceId) },
      status: { in: ['completed', 'SUCCESS'] }
    },
    include: {
      coupon: true
    }
  });
  const transactionMap = new Map();
  transactions.forEach(tx => {
    const key = `${tx.userId}-${tx.serviceId}`;
    if (!transactionMap.has(key) || new Date(tx.createdAt) > new Date(transactionMap.get(key).createdAt)) {
      transactionMap.set(key, tx);
    }
  });

  // 3. Prepare Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Subscriptions");

worksheet.columns = [
    { header: 'S.No', key: 'sno', width: 8 },
    { header: 'User Name', key: 'userName', width: 20 },
    { header: 'User Email', key: 'userEmail', width: 25 },
    { header: 'User Phone', key: 'userPhone', width: 18 }, // Added
    { header: 'Service Name', key: 'serviceName', width: 20 },
    { header: 'Service Type', key: 'serviceType', width: 18 },
    { header: 'Grant Type', key: 'grantType', width: 15 },
    { header: 'Plan', key: 'plan', width: 14 }, // Added
    { header: 'Plan Days', key: 'planDays', width: 12 }, // Added
    { header: 'Purchase Date', key: 'purchaseDate', width: 18 },
    { header: 'Expiry Date', key: 'expiryDate', width: 18 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Order ID', key: 'orderId', width: 18 }, 
    { header: 'Amount Paid (₹)', key: 'amountPaid', width: 16 },
    { header: 'Coupon Used', key: 'couponUsed', width: 16 },
    { header: 'Discount %', key: 'discount', width: 12 },
    { header: 'Grant Reason', key: 'grantReason', width: 20 },
    { header: 'Parent Service (main)', key: 'parentService', width: 20 },
    { header: 'Subscription ID', key: 'subscriptionId', width: 36 },
    { header: 'Granted By (Admin ID)', key: 'grantedBy', width: 24 },
    { header: 'Transaction ID', key: 'transactionId', width: 36 },
    { header: 'Payment ID', key: 'paymentId', width: 24 },
    { header: 'Payment Gateway', key: 'paymentGateway', width: 18 },
    { header: 'Currency', key: 'currency', width: 10 },
    { header: 'Created At', key: 'createdAt', width: 18 },
    { header: 'Coupon Description', key: 'couponDescription', width: 24 },
  ];

   subscriptions.forEach((sub, idx) => {

      let amountPaid = null, couponUsed = null, discount = null, orderId = null, transactionId = null, paymentId = null, paymentGateway = null, currency = null, couponDescription = null, createdAt = null;
      if (sub.grantType === 'PURCHASED') {
         const tx = transactionMap.get(`${sub.userId}-${sub.serviceId}`);
         amountPaid = tx?.amount ?? '';
         couponUsed = tx?.coupon?.code ?? '';
         discount = tx?.coupon?.percentOff ?? '';
         orderId = tx?.orderId ?? '';
         transactionId = tx?.id ?? '';
         paymentId = tx?.paymentId ?? '';
         paymentGateway = tx?.paymentGateway ?? '';
         currency = tx?.currency ?? '';
         couponDescription = tx?.coupon?.description ?? '';
         createdAt = tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '';
      }

      // Decide plan name and plan days
      // Use ServicePlan info instead of tenure
      let plan = '';
      let planDays = '';
      if (sub.service?.type === 'PORTFOLIO_REVIEW') {
         plan = sub.servicePlan?.stockLimit ? `${sub.servicePlan.stockLimit} stocks` : '';
         planDays = ''; // Portfolio Review doesn't use days
      } else {
         plan = sub.servicePlan?.label ? `${sub.servicePlan.label}` : '';
         planDays = sub.servicePlan?.durationInDays ? `${sub.servicePlan.durationInDays}` : '';
      }


      worksheet.addRow({
         sno: idx + 1,
         userName: sub.user?.name || 'N/A',
         userEmail: sub.user?.email || 'N/A',
         userPhone: sub.user?.phone || 'N/A',
         serviceName: sub.service?.name || 'N/A',
         serviceType: sub.service?.type?.replace(/_/g, ' ') || 'N/A',
         grantType: sub.grantType?.replace(/_/g, ' ') || 'N/A',
         plan,
         planDays,
         purchaseDate: sub.purchaseDate ? formatDateWithTime(sub.purchaseDate) : '',
         expiryDate: sub.expiryDate ? formatDateWithTime(sub.expiryDate) : '',
         status: sub.isActive ? 'Active' : 'Expired',
         amountPaid,
         orderId,
         couponUsed,
         discount,
         grantReason: sub.grantReason || '',
         parentService: sub.parentServiceId || '',
         subscriptionId: sub.id || '',
         grantedBy: sub.grantedBy || '',
         transactionId,
         paymentId,
         paymentGateway,
         currency,
         createdAt: sub.createdAt ? formatDateWithTime(sub.createdAt) : '',
         couponDescription,
      });
   });
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=users.xlsx",
    },
  });
})