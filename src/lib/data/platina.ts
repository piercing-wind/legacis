import { db } from '@/lib/db';
import { ServicePlatinaWealth, UserPlatinaRecommendation, UserPlatinaStockHistory, UserPlatinaStockList, UserRiskProfile } from '@/prisma/generated/client';
// Stock Recommendation
export const findUserPlatinaRecommendation = async (userId: string) => {
   const result = await db.userPlatinaRecommendation.findFirst({
      where: {
         userId,
         isActive: true,
      },
      include:{
         riskProfile: true,
         platinaService: true,
         stockHistory : true,
         stocks : {
            where:{
               isActive: true,
            }
         }
      }
   })
   return result;
}

export type UserPlatinaRecommendationWithDetails = (UserPlatinaRecommendation & {
  riskProfile: UserRiskProfile | null;     
  platinaService: ServicePlatinaWealth;
  stocks: UserPlatinaStockList[];
  stockHistory : UserPlatinaStockHistory[];
}) | null;