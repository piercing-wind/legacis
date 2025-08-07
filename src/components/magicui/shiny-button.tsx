"use client";

import { cn } from "@/lib/utils";
import { motion, MotionProps } from "motion/react";
import React from "react";

const animationProps = {
  animate: { "--x": "120%" },
  initial: { "--x": "-40%" },
  whileTap: { scale: 0.95 },
  transition: {
    "--x": {
      repeat: Infinity,
      repeatType: "loop" as const,
      duration: 5,
      ease: "linear" as const,
    }
  }
};

interface ShinyButtonProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, keyof MotionProps>,
    MotionProps {
  children: React.ReactNode;
  className?: string;
}

export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  ShinyButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(
        "relative cursor-pointer rounded-lg px-6 py-2 font-semibold backdrop-blur-xl border transition-shadow duration-300 ease-in-out hover:shadow flex items-center justify-center overflow-hidden",
        className,
      )}
      style={{
        position: "relative",
        zIndex: 0,
      }}
      {...animationProps}
      {...props}
    >
      {/* Shimmer overlay */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
        style={{
          background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
          transform: "translateX(var(--x))",
        }}
      />
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
});

ShinyButton.displayName = "ShinyButton";