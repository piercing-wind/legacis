import { PaymentStatusClient } from "@/components/payment-status-check";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};


export default async function ThankYouPage({ searchParams }: PageProps) {
  const params = await searchParams || {};
  const orderId = params.orderId as string | undefined;

  return (
    <div className="py-20 my-20 flex items-center justify-center ">
      <PaymentStatusClient orderId={orderId} />
    </div>
  );
}
