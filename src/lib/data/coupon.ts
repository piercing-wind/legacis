'use server';
import { db } from '@/lib/db';

export const findCouponByCode = async ({
  code,
  serviceId,
  planId,
}: {
  code: string,
  serviceId: string | null,
  planId: string | null,
}) => {
  console.log("Finding coupon with code:", code, "for serviceId:", serviceId, "and planId:", planId);
  
  return await db.coupon.findFirst({
    where: {
      code,
      expiryDate: { gt: new Date() },
      OR: [
        // Global coupon (both null)
        { serviceId: null, servicePlanId: null },
        
        // Service-specific, plan-global
        ...(serviceId !== null ? [{ serviceId, servicePlanId: null }] : []),
        
        // Plan-specific (service can be derived from plan)
        ...(planId !== null ? [{ servicePlanId: planId }] : []),
        
        // Both service and plan specific
        ...(serviceId !== null && planId !== null 
          ? [{ serviceId, servicePlanId: planId }] : [])
      ]
    }
  });
};