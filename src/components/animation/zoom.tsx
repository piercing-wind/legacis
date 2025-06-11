'use client';

import { motion } from "framer-motion";
import React from "react";

interface ZoomProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const ZoomIn: React.FC<ZoomProps> = ({ children, delay = 0, className }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay,
      }}
      style={{ overflow: "hidden" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ZoomOut: React.FC<ZoomProps> = ({ children, delay = 0, className }) => {
  return (
    <motion.div
      initial={{ scale: 1.5 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay,
      }}
      style={{ overflow: "hidden" }}
      className={className} 
    >
      {children}
    </motion.div>
  );
};