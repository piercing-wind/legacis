"use client";

import React, { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export function ModeToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setIsOpen(false); 
  };
  
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full"
      >
         <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
         <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
         <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-neutral-800 shadow-lg rounded-md overflow-clip">
          <Button
            variant={"ghost"}
            onClick={() => handleThemeChange("light")}
            className="block w-full px-4 py-2 text-left text-sm font-normal hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            Light
          </Button>
          <Button
            variant={"ghost"}
            onClick={() => handleThemeChange("dark")}
            className="block w-full px-4 py-2 text-left text-sm font-normal hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            Dark
          </Button>
          <Button
            variant={"ghost"}
            onClick={() => handleThemeChange("system")}
            className="block w-full px-4 py-2 text-left text-sm font-normal hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            System
          </Button>
        </div>
      )}
    </div>
  );
}