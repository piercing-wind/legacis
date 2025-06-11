'use server'
import { db } from '@/lib/db';

export const findCouponByCode = async (code: string) => {
  return await db.coupon.findFirst({
    where: {
      code,
      isActive: true,
      expiryDate: {
        gt: new Date(),
      },
    },
  });
}