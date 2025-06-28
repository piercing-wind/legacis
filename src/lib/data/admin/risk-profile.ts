import { db } from "@/lib/db"

export const getUsersRiskProfile = async () => {
   const users = await db.userRiskProfile.findMany({
      where:{
         isActive: true,
      },
      include:{
         user: true,
         
      },
      orderBy: {
        completedAt  : "desc",
      },
   })
   return users
}

export const getUserRiskProfileAnswers = async (userId: string) => {
   const result = await db.userRiskProfileResponse.findMany({
      where: {
         userId,
      },
      include: {
         question: true,
      },
   });
   return result;
}

export const getUserRiskProfileById = async (userId: string) => {
   const result = await db.userRiskProfile.findUnique({
      where: {
         userId,
      }
   });
   return result;
}



/**
 * This function is for admin pages
 */
export const getRiskProfileQuestions = async () => {
   const result = await db.riskProfileQuestion.findMany({
      orderBy: {
         order: "asc",
      }
   });
   return result;
};