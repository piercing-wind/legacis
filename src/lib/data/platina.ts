import { db } from '@/lib/db';
import { ServicePlatinaWealth, UserPlatinaRecommendation, UserPlatinaStockList, UserRiskProfile } from '@/prisma/generated/client';

export const findUserPlatinaRecommendation = async (userId: string) => {
   const result = await db.userPlatinaRecommendation.findFirst({
      where: {
         userId,
         isActive: true,
      },
      include:{
         riskProfile: true,
         platinaService: true,
         stocks : true
      }
   })
   return result;
}

export type UserPlatinaRecommendationWithDetails = (UserPlatinaRecommendation & {
  riskProfile: UserRiskProfile | null;     
  platinaService: ServicePlatinaWealth;
  stocks: UserPlatinaStockList[];
}) | null;