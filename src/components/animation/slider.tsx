'use client';

import { motion } from "framer-motion";
import React from "react";

interface SliderProps {
  children: React.ReactNode;
}

export const SliderRight: React.FC<SliderProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      transition={{
        duration: 1.5,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
};

export const SliderLeft: React.FC<SliderProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      transition={{
        duration: 1.5,
        ease: [0.25, 0.1, 0.25, 1], 
      }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
};

export const SliderUp: React.FC<SliderProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{
        duration: 1.5,
        ease: [0.25, 0.1, 0.25, 1], 
      }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
};

export const SliderDown: React.FC<SliderProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      transition={{
        duration: 1.5,
        ease: [0.25, 0.1, 0.25, 1], 
      }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
};
