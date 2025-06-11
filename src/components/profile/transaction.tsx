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
import { ComboPlan, Service, Transaction as UserTransaction } from "@/prisma/generated/client";
import { formatHumanDate } from "@/lib/utils";

type TransactionWithService = UserTransaction & { service: Service | null; comboPlan : ComboPlan | null };

const Transaction = ({
  userTransactions,
}: {
  userTransactions: TransactionWithService[] | null;
}) => {
  if (!userTransactions || userTransactions.length === 0) {
    return (
      <section className="w-full p-4 border rounded-2xl my-8">
        <p className="text-center text-gray-500">No transactions found yet.</p>
      </section>
    );
  }
  console.log("UserTransactions")
  return (
    <section id="transactions" className="w-full p-4 border rounded-2xl my-8">
      {/* Mobile Card View */}
      <div className="flex flex-col gap-4 sm:hidden">
        {userTransactions.map((txn) => (
          <div key={txn.id} className="border rounded-xl p-4 flex flex-col gap-2 bg-white dark:bg-neutral-900">
            <div className="flex justify-between items-center">
              <span className="font-semibold"> {txn.service?.name || txn.comboPlan?.name || "N/A"}</span>
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
            <div className="text-xs text-gray-500">Invoice: {txn.id.slice(0, 8).toUpperCase()}</div>
            <div className="text-xs">Method: {txn.paymentGateway}</div>
            <div className="text-xs">Date: {formatHumanDate(txn.createdAt)}</div>
            <div className="text-right font-bold">{txn.currency} {txn.amount.toFixed(2)}</div>
          </div>
        ))}
      </div>
      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <Table>
          <TableCaption>Your recent transactions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userTransactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-medium">
                  {txn.id.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>{txn.service?.name || "N/A"}</TableCell>
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
                <TableCell>{txn.paymentGateway}</TableCell>
                <TableCell>
                  {formatHumanDate(txn.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  {txn.currency} {txn.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default Transaction;