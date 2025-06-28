"use server";
import { RiskProfileQuestion, UserRiskProfileResponse } from "@/prisma/generated/client";
import { db } from "../db";

export type RiskProfileQuestionWithResponses = RiskProfileQuestion & {
  userResponses: UserRiskProfileResponse[];
};

export type GetRiskProfileQuestionsResult = {
  success: boolean;
  data?: RiskProfileQuestionWithResponses[];
  message?: string;
};
export const getRiskProfileQuestions = async (userId?:string) : Promise<GetRiskProfileQuestionsResult> => {
  try {
    const result = await db.riskProfileQuestion.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "desc",
      },
      include:{
         userResponses :{
            where: {
               userId,
            }
         }
      }
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};


