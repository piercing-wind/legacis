import { ServiceType } from "@/prisma/generated/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ServiceWithComplimentary } from "./data/services";

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

/**
 * Formats a date string or Date object into "day-month-year-time" format.
 * @param date - The date string or Date object to format
 * @returns A formatted date string (e.g., "11-07-2025 14:30:00")
 */
export function formatDateWithTime(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: 'short',
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).replace(',', '');
}



/**
 * Generates a unique S3 file key with sanitized filename, timestamp, and optional folder prefix.
 * 
 * @param fileName - The original file name (e.g., from file upload)
 * @param folder - Optional folder inside the bucket (default: 'blog')
 * @returns The unique S3 file key (path inside bucket)
 */
export function generateUniqueS3FileKey(fileName: string, folder = "blog"): string {
  const fixedFileName = fileName.replace(/[\s\u00A0\u200B]+/g, "_");
  const timestamp = Date.now();

  const lastDotIndex = fixedFileName.lastIndexOf(".");
  const fileExtension = lastDotIndex !== -1 ? fixedFileName.substring(lastDotIndex) : "";
  const baseName = lastDotIndex !== -1 ? fixedFileName.substring(0, lastDotIndex) : fixedFileName;

  const uniqueFileName = `${baseName}_${timestamp}${fileExtension}`;
  return `${folder}/${uniqueFileName}`;
}


/**
 * 
 * @param url 
 * @returns filekey
 */

export function extractFileKeyFromUrl(url: string) {
   const pathname = new URL(url);
  return pathname.pathname.substring(1);
}


export function normalizeRationale(val: any): { text: string } {
  if (!val) return { text: "" };
  if (typeof val === "object" && "text" in val) return { text: val.text ?? "" };
  if (typeof val === "string") return { text: val };
  return { text: "" };
}


/**
 * Returns the route link for a service based on its type and slug.
 * @param serviceType - The type of the service
 * @param slug - The slug of the service
 * @returns The route link as a string
 */
export function getServiceLink(serviceType: ServiceType, slug: string): string {
  if (serviceType === 'PLATINA_WEALTH') {
    return '/platina-wealth';
  }
  if (serviceType === 'RESEARCH_ADVISORY_MUTUAL_FUNDS') {
    return '/mutual-funds';
  }
  if( serviceType === 'SMALLCASE') {
   return slug.startsWith('https://') ? slug : `/smallcase/${slug}`;
  }
  return `/services/${slug}`; 
}




export function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

/**
 * Returns a new array containing all services except mutual funds and portfolio review,
 * and at most one mutual fund and one portfolio review service.
 */
export function getUniqueSpecialServices(services: ServiceWithComplimentary[]) {
  const mf = services.find(s => s.type === 'RESEARCH_ADVISORY_MUTUAL_FUNDS');
  const pr = services.find(s => s.type === 'PORTFOLIO_REVIEW');
  const others = services.filter(
    (service) =>
      service.type !== 'RESEARCH_ADVISORY_MUTUAL_FUNDS' &&
      service.type !== 'PORTFOLIO_REVIEW'
  );
  const result = [...others];
  if (mf) result.push(mf);
  if (pr) result.push(pr);
  return result;
}