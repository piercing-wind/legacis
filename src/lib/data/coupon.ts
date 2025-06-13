'use server'
import { db } from '@/lib/db';

export const findCouponByCode = async ({
  code,
  serviceId,
  planDays,
  comboPlanId
}: {
  code: string,
  serviceId?: string,
  planDays?: number,
  comboPlanId?: string
}) => {
  const where: any = {
    code,
    expiryDate: { gt: new Date() },
    AND: [
      // planDays match or is null (global)
      {
        OR: [
          { planDays: planDays ?? undefined },
          { planDays: null }
        ]
      },
      // serviceId match or is null (global)
      {
        OR: [
          { serviceId: serviceId ?? undefined },
          { serviceId: null }
        ]
      },
      // comboPlanId match or is null (global)
      {
        OR: [
          { comboPlanId: comboPlanId ?? undefined },
          { comboPlanId: null }
        ]
      }
    ]
  };

  return await db.coupon.findFirst({ where });
};