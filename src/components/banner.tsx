'use client';
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Banner as BannerData } from "@/prisma/generated/client";

interface BannerProps {
  bannerData : BannerData;
  className?: string; // Optional className for additional styling
}

export default function Banner({
   bannerData,
   className = "",
}: BannerProps) {

  const { imageUrl, text, buttonUrl, buttonLabel, title, bgColor } = bannerData;
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          role="region"
          aria-label="Promotional banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={cn("z-50 px-4 lg:px-10 xl:px-24 w-full", className)}
        >
          <div className={`flex flex-col md:flex-row items-center justify-between bg-legacisGreen  px-4 ${imageUrl ? 'py-3 md:py-4' : 'py-6 md:py-8' } md:px-8  rounded-b-lg`}
           style={{ background: bgColor || "#4aedb9" }}
          >
            <div className="flex items-center gap-3 w-full">
               {imageUrl && (
                  <div className="flex-shrink-0 w-24 h-16 md:w-40 md:h-24 aspect-video rounded-lg overflow-hidden">
                     <Image
                        src={imageUrl}
                        alt={title || "Banner Image"}
                        width={160}
                        height={90}
                        className="object-cover w-full h-full"
                        priority
                     />
                  </div>
               )}
              <p className="text-sm md:text-base font-medium !text-neutral-700 flex-1 px-2">
                {text}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 mt-4 sm:mt-2 md:mt-0 sm:ml-2 w-full md:w-auto">
               <Button asChild variant={'outline'} className="text-neutral-700">
                  <Link
                     href={buttonUrl}
                     target="_blank"
                     className=" px-3 py-1.5 rounded-lg text-xs md:text-sm !tracking-wide transition dark:hover:!text-neutral-800"
                  >
                     {buttonLabel}
                  </Link>
               </Button>
              <Button
                aria-label="Close banner"
                variant={'ghost'}
                onClick={() => setVisible(false)}
                className="ml-2 p-2 rounded-full text-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
              >
                  <X/>
              </Button>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}