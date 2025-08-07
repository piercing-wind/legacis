'use server'

import { db } from "../db";

export const getUserPurchasedServicesPortfolio = async (userId: string) => {
   return await db.userPurchasedServices.findMany({
      where: {
         userId,
         service: {
            type: "PORTFOLIO_REVIEW",
         },
      },
      include: {
         servicePlan: true,
         service: {
            select:{
               id : true,
               slug: true,
               name: true,
               description: true,
               tag: true,
               type: true,
               features: true,
               plans : true,
            }
         },
         portfolioReview : true
      },
      orderBy: {
         purchaseDate: "desc",
      },
   });
}
