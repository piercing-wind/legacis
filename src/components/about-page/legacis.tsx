"use client";
import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { GradientLine } from "../icon";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
const Legacis = () => {
   const [activeIndex, setActiveIndex] = React.useState(0);
   useEffect(() => {
      const interval = setInterval(() => {
         setActiveIndex((prev) => (prev + 1) % LEGACIS_DATA.length);
      }, 3000); // Change every 3 seconds
   
      return () => clearInterval(interval);
   }, [activeIndex]);

  return (
    <div className="relative w-full rounded-2xl p-4 sm:p-8 !py-24 flex flex-col items-center">
      <Image
        src="/about-page-hero.jpg"
        alt="Legacis Logo"
        fill
        style={{ objectFit: "cover" }}
        className="absolute top-0 left-0 opacity-40 dark:opacity-20 rounded-2xl overflow-clip -z-1"
      />
      <h1 className="mb-14 sm:mb-20 text-3xl sm:text-4xl text-neutral-700 dark:text-neutral-50 z-10">The Legacis Framework</h1>
      <div className="flex items-center flex-wrap gap-4 sm:gap-8 w-full justify-center relative">
        {LEGACIS_DATA.map((item, idx) => (
          <motion.div
            key={item.letter}
            onMouseEnter={() => setActiveIndex(idx)}
            onClick={() => setActiveIndex(idx)}
            className={cn(`rounded-full p-6  h-20 w-20 sm:h-32 sm:w-32 transition-transform 
             flex items-center justify-center gap-4 shrink-0 backdrop-blur-sm
            border border-neutral-50 dark:border-neutral-600
            `, `${activeIndex === idx && "border border-blue-200 dark:border-blue-200/50 shadow-2xl shadow-legacisGreen/95"}`)}
            animate={{
              y: [0, -10, 0], // Move up 20px, then back to 0
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: idx * 0.2, // Stagger each circle a bit
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl sm:text-5xl text-neutral-600 dark:text-neutral-100">{item.letter}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center sm:gap-8 mt-10 sm:mt-20 max-w-3xl w-full relative">
         <Button
          onClick={() => setActiveIndex((prev) => (prev - 1 + LEGACIS_DATA.length) % LEGACIS_DATA.length)}
          variant={'outline'}
          className="absolute -left-8 top-1/2 -translate-y-1/2 sm:relative bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg z-10 flex items-center border-0 justify-center hover:bg-neutral-800 hover:text-white shrink-0 h-10 w-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
         <div className="max-w-2xl min-h-60 w-full border border-neutral-50 dark:border-neutral-600 
g p-6 backdrop-blur-sm shadow-lg shadow-neutral-200 rounded-xl dark:shadow-neutral-800/80 overflow-clip">
            <AnimatePresence mode="wait">
               <motion.div
                  key={activeIndex}
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -60, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
               >
                  <h2 className="text-3xl font-medium mb-4 text-neutral-600 dark:text-neutral-50">{LEGACIS_DATA[activeIndex].letter}</h2>
                  <h3 className="text-xl sm:text-2xl font-medium mb-1 text-neutral-700 dark:text-neutral-100">
                   {LEGACIS_DATA[activeIndex].title}
                  </h3>
                  <p className="text-xs sm:text-sm !text-gray-500 mb-2 dark:!text-neutral-400"> {LEGACIS_DATA[activeIndex].focus} </p>
                  <div className="w-1/2 border-t border-neutral-400 mb-4"/>
                  <p className="text-sm sm:text-base !text-gray-700 dark:!text-neutral-200">{LEGACIS_DATA[activeIndex].lookFor}</p>
               </motion.div>
            </AnimatePresence>
         </div>
        <Button
          onClick={() => setActiveIndex((activeIndex + 1) % LEGACIS_DATA.length)}
         variant={'outline'}
          className="absolute -right-8 top-1/2 -translate-y-1/2 sm:relative bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg z-10 flex items-center border-0 justify-center hover:bg-neutral-800 hover:text-white shrink-0 h-10 w-10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

    </div>
  );
};

export default Legacis;

const LEGACIS_DATA = [
  {
    letter: "L",
    title: "Leadership",
    focus: "Market Position & Promoter Quality",
    lookFor: "Industry leader, strong management, rising market share",
    color: "bg-blue-100 text-blue-800",
    icon: "👑",
  },
  {
    letter: "E",
    title: "Earnings Momentum",
    focus: "Profit Growth & Consistency",
    lookFor: "PAT growth (QoQ/YoY), margin expansion, ROCE > 15%",
    color: "bg-green-100 text-green-800",
    icon: "📈",
  },
  {
    letter: "G",
    title: "Growth Trajectory",
    focus: "Revenue CAGR & Scalability",
    lookFor: "3Y/5Y Sales CAGR > 15%, visibility for future expansion",
    color: "bg-yellow-100 text-yellow-800",
    icon: "🚀",
  },
  {
    letter: "A",
    title: "Asset Efficiency",
    focus: "Return Ratios & Capital Use",
    lookFor: "ROCE, ROE, Asset Turnover, WC Cycle",
    color: "bg-purple-100 text-purple-800",
    icon: "🏦",
  },
  {
    letter: "C",
    title: "Cash Flows & Capital Discipline",
    focus: "Free Cash Flow, Capex, Debt",
    lookFor: "Positive FCF, prudent capex, no pledging",
    color: "bg-pink-100 text-pink-800",
    icon: "💸",
  },
  {
    letter: "I",
    title: "Institutional Interest",
    focus: "Smart Money Validation",
    lookFor: "FII/DII/Mutual Fund holding trends, promoter buying",
    color: "bg-indigo-100 text-indigo-800",
    icon: "🏛️",
  },
  {
    letter: "S",
    title: "Stock Price Strength",
    focus: "Technical Momentum",
    lookFor: "Base breakout, high volume up",
    color: "bg-orange-100 text-orange-800",
    icon: "📊",
  },
];
