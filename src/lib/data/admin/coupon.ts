'use server';

import { db } from "@/lib/db";

export const findCoupons = async () => {
   return await db.coupon.findMany({
      orderBy: {
         createdAt: 'desc',
      },
   });
}

export const findCouponById = async (id: string) => {
   return await db.coupon.findUnique({
      where: {
         id,
      },
   });
}