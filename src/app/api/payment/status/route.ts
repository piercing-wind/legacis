import { auth } from "@/auth";
import { ia_cashfree, ra_cashfree } from "@/lib/payment/cashfree";

export const GET = auth(async (request) => {
  if (!request.auth) throw new Error("Unauthorized");
  
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const payment_category = searchParams.get("payment_category") as 'ia' | 'ra' | undefined;
  
  if (!orderId) {
    return new Response(JSON.stringify({ error: "Missing orderId" }), { status: 400 });
  }

  try {
    
    let orderRes;
    if(payment_category === 'ia'){
      orderRes = await ia_cashfree.PGFetchOrder(orderId);
    }else{
      orderRes = await ra_cashfree.PGFetchOrder(orderId);
    } 

    const orderStatus = orderRes?.data?.order_status || "PENDING";

    // Return both status and full order details
    return new Response(
      JSON.stringify({ status: orderStatus, order: orderRes?.data }),
      { status: 200 }
    );

  } catch (error) {
    // AxiosError handling
    if (error && typeof error === "object" && "isAxiosError" in error && (error as any).isAxiosError) {
      const axiosError = error as any;
      const status = axiosError.response?.status || 500;
      const message =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Unknown error from payment gateway";
      return new Response(JSON.stringify({ error: message, details: axiosError.response?.data }), { status });
    }
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
});