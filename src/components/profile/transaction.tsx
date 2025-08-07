import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Service, ServicePlan, Transaction as UserTransaction } from "@/prisma/generated/client";
import { formatDateWithTime } from "@/lib/utils";

type TransactionWithDetails = UserTransaction & { 
  service: Service | null;
  servicePlan: ServicePlan | null;
};

const Transaction = ({
  userTransactions,
}: {
  userTransactions: TransactionWithDetails[] | null;
}) => {
  if (!userTransactions || userTransactions.length === 0) {
    return (
      <section className="w-full p-4 border rounded-2xl my-8">
        <p className="text-center text-gray-500">No transactions found yet.</p>
      </section>
    );
  }

  // Helper function to get plan display info
  const getPlanDisplay = (txn: TransactionWithDetails) => {
    const plan = txn.servicePlan;
    
    if (!plan) return "N/A";
    
    // For Portfolio Review, show stocks
    if (txn.service?.type === 'PORTFOLIO_REVIEW') {
      return plan.stockLimit ? `${plan.stockLimit} stocks` : "N/A";
    }
    
    // For other services, show duration
    const days = plan.durationInDays;
    const months = Math.round(days / 30);
    return months >= 1 ? `${months} month${months > 1 ? 's' : ''}` : `${days} days`;
  };

  return (
    <section id="transactions" className="w-full p-4 border rounded-2xl my-8">
      {/* Mobile Card View */}
      <div className="flex flex-col gap-4 sm:hidden">
        {userTransactions.map((txn) => {
          const planDisplay = getPlanDisplay(txn);
           
          return(
            <div key={txn.id} className="border rounded-xl p-4 flex flex-col gap-2 bg-white dark:bg-neutral-900">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{txn.service?.name || "N/A"}</span>
                <span
                  className={
                    txn.status === "SUCCESS"
                      ? "text-green-600 font-semibold"
                      : txn.status === "FAILED"
                      ? "text-red-600 font-semibold"
                      : "text-yellow-600 font-semibold"
                  }
                >
                  {txn.status}
                </span>
              </div>
              <div className="text-xs">Plan: {planDisplay}</div>
              <div className="text-xs text-gray-500">Invoice: {txn.orderId}</div>
              <div className="text-xs">Method: {txn.paymentGateway}</div>
              <div className="text-xs">Date: {formatDateWithTime(txn.createdAt)}</div>
              <div className="text-right font-bold">{txn.currency} {txn.amount?.toFixed(2) || '0.00'}</div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <Table>
          <TableCaption>Your recent transactions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userTransactions.map((txn) => {
              const planDisplay = getPlanDisplay(txn);
           
              return(
                <TableRow key={txn.id}>
                  <TableCell className="font-medium">
                    {txn.orderId}
                  </TableCell>
                  <TableCell>{txn.service?.name || "N/A"}</TableCell>
                  <TableCell>{planDisplay}</TableCell>
                  <TableCell>
                    <span
                      className={
                        txn.status === "SUCCESS"
                          ? "text-green-600 font-semibold"
                          : txn.status === "FAILED"
                          ? "text-red-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                      }
                    >
                      {txn.status}
                    </span>
                  </TableCell>
                 <TableCell>
                     {typeof txn.webhookResponse === "string"
                        ? (() => {
                           try {
                              const parsed = JSON.parse(txn.webhookResponse);
                              return parsed?.data?.payment?.payment_group || "N/A";
                           } catch {
                              return "N/A";
                           }
                           })()
                        : "N/A"}
                     </TableCell>
                  <TableCell>
                    {formatDateWithTime(txn.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {txn.currency} {txn.amount?.toFixed(2) || '0.00'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default Transaction;