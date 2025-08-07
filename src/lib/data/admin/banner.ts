'use server';

import { db } from "@/lib/db";

export async function findBanners() {
   return db.banner.findMany({
      orderBy: {
         createdAt: 'desc',   
      },
   });
}

export async function findBannerById(id: string) {
   return db.banner.findUnique({
      where: {
         id,
      },
   });
}