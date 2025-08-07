'use client';

import { motion } from "framer-motion";
import React from "react";

interface ZoomProps extends React.ComponentProps<typeof motion.div> {
  delay?: number;
}

export const ZoomIn: React.FC<ZoomProps> = ({ children, delay = 0, ...rest }) => {
  return (
    <motion.div
      initial={{ scale: 0.5 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'tween',
        stiffness: 100,
        damping: 10,
        delay,
      }}
      style={{ overflow: "hidden", ...rest.style }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export const ZoomOut: React.FC<ZoomProps> = ({ children, delay = 0, ...rest }) => {
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
      style={{ overflow: "hidden", ...rest.style }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};