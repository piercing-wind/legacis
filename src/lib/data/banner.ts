'use server';
import { db } from "@/lib/db";

export const findBanners = async () => {
  return await db.banner.findMany({
     where: {
       isActive: true, // Only fetch active banners
     },
     orderBy: { createdAt: "desc" }
  });
}