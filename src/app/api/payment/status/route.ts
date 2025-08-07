import { auth } from "@/auth";
import { cashfree } from "@/lib/payment/cashfree";

export const GET = auth(async (request) => {
  if (!request.auth) throw new Error("Unauthorized");
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    return new Response(JSON.stringify({ error: "Missing orderId" }), { status: 400 });
  }

  try {
    const orderRes = await cashfree.PGFetchOrder(orderId);
    const orderStatus = orderRes?.data?.order_status || "PENDING";
    // Return both status and full order details
    return new Response(
      JSON.stringify({ status: orderStatus, order: orderRes?.data }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
});