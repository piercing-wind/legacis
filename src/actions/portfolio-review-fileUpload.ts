'use server'

import { db } from "@/lib/db"

export async function updatePortfolioReviewFile({
   userPurchasedServiceId,
   uploadedFileName,
   uploadedFileUrl
}:{
   userPurchasedServiceId: string;
   uploadedFileName: string;
   uploadedFileUrl: string;
}){
   try {
      
      const portfolioReview = await db.portfolioReview.update({
         where: {
            userPurchasedServiceId,
         },
         data: {
            uploadedFileName,
            uploadedFileUrl,
            status: "UNDER_REVIEW",
         },
      })
      return {success : true, portfolioReview};
   } catch (error) {
      console.error("Error updating portfolio review file:", error);
      return {success : false, error: `${(error as Error).message}`};
   }
}