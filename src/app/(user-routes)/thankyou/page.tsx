import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white dark:bg-neutral-800 rounded-xl -mt-14 shadow-lg p-8 flex flex-col items-center max-w-xl w-full">
        <Clock className="text-yellow-500 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold text-yellow-700 dark:text-yellow-500 mb-2">Thank You!</h1>
        <p className="!text-sm text-center mb-6">
          We&rsquo;re processing your payment.
          <br />
          If your payment is successful, you&rsquo;ll receive a confirmation
          email from us.
          <br />
          If you have any questions, please contact our support team.
        </p>
        <Link href="/dashboard" passHref>
          <Button asChild>
            <span>Go to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
