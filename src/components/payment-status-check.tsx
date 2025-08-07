"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Timer } from "lucide-react";

type OrderDetails = {
  order_status: string;
  order_amount: number;
  order_currency: string;
  created_at: string;
  order_id: string;
  order_tags?: {
    plan?: string;
    agreement?: string;
    coupon?: string;
  };
  customer_details?: {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
  };
};

export function PaymentStatusClient({ orderId }: { orderId?: string }) {
  const [status, setStatus] = useState<"pending" | "success" | "failed" | "timeout">("pending");
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let elapsed = 0;
    const interval = setInterval(async () => {
      elapsed += 3;
      if (elapsed >= 1800) { // 30 minutes = 1800 seconds
        setStatus("timeout");
        clearInterval(interval);
        return;
      }
      try {
        const res = await fetch(`/api/payment/status?orderId=${orderId}`);
        const data = await res.json();
        if (data.status === "PAID") {
          setStatus("success");
          setOrder(data.order);
          clearInterval(interval);
        } else if (data.status === "FAILED" || data.status === "CANCELLED") {
          setStatus("failed");
          setOrder(data.order);
          clearInterval(interval);
        } else {
          setOrder(data.order);
        }
      } catch {
        // Optionally handle error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="w-full max-w-md mx-auto rounded-xl bg-white dark:bg-neutral-800 shadow-2xl shadow-neutral-100 dark:shadow-neutral-700 p-6 flex flex-col items-center gap-4">
      <div className="mb-2">
        {status === "pending" && (
          <Clock className="text-yellow-500 w-10 h-10 animate-spin" />
        )}
        {status === "success" && (
          <CheckCircle className="text-green-500 w-10 h-10" />
        )}
        {status === "failed" && (
          <XCircle className="text-red-500 w-10 h-10" />
        )}
        {status === "timeout" && (
          <Timer className="text-gray-400 w-10 h-10" />
        )}
      </div>
      <h2 className="text-xl font-semibold mb-1">
        {status === "pending" && "Verifying Payment"}
        {status === "success" && "Payment Successful"}
        {status === "failed" && "Payment Failed"}
        {status === "timeout" && "Verification Timed Out"}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">
        {status === "pending" &&
          "Your payment is being verified. This may take a few moments."}
        {status === "success" &&
          "Thank you! Your payment was confirmed. You now have access to your purchased service."}
        {status === "failed" &&
          "Unfortunately, your payment could not be confirmed. Please contact support or try again."}
        {status === "timeout" &&
          "Payment verification timed out after 30 minutes. Please check your dashboard or contact support if you have not received confirmation."}
      </p>
      <Link href="/dashboard" passHref>
        <Button variant="outline" className="w-full mt-2">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}