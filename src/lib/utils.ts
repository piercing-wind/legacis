import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 
 * @param identifier - The identifier to be checked
 * @description This function checks if the identifier is an email, phone number, or username.
 * @example
 * identifyInputType("example@gmail.com") // returns "email"
 * identifyInputType("1234567890") // returns "phone"
 * identifyInputType("username123") // returns "username"
 * @returns "email" | "phone" | "username" 
 */
export function identifyInputType(identifier: string): "email" | "phone" | "username" {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,15}$/;

  if (emailRegex.test(identifier)) {
    return "email";
  } else if (phoneRegex.test(identifier)) {
    return "phone";
  } else {
    return "username";
  }
}


/**
 * Converts a date string or Date object to a human-readable format like "20 May 2025"
 * @param date - The date string or Date object
 * @returns A formatted date string (e.g., "20 May 2025")
 */
export function formatHumanDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).replace(/ /, ' ');
  // "20 May 2025"
}