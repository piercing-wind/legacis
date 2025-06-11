import React, { useRef } from "react";
import { CheckCircle2 } from "lucide-react";
 
import { Confetti, type ConfettiRef } from "@/components/magicui/confetti";
import { cn } from "@/lib/utils";

type ThankYouProps = {
  message?: string;
  children?: React.ReactNode;
  className?: string;
};

const ThankYou: React.FC<ThankYouProps> = ({
  message = "Thank you!",
  children,
  className,
}) => {
  const confettiRef = useRef<ConfettiRef>(null);
  return (
    <div className={cn(className, "flex flex-col relative items-center justify-center min-h-[250px] w-full px-4 py-8 bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-neutral-900 dark:to-green-950 rounded-xl shadow-lg text-center")}>
      <CheckCircle2 className="text-green-500 dark:text-green-400 mb-4" size={56} />
      <h2 className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-300 mb-2">Thank You!</h2>
      <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-300 mb-2">{message}</p>
      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-0 size-full"
        onMouseEnter={() => {
          confettiRef.current?.fire({});
        }}
      />
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default ThankYou;