'use server';
import { db } from "@/lib/db";
import { RiskLevel } from "@/prisma/generated/client";


export const saveRiskProfileAnswers = async (data: Record<string, { answer: any; weight: number }>, userId: string) => {
  try {
    const upserts = Object.entries(data).map(([questionId, {answer, weight}]) =>
      db.userRiskProfileResponse.upsert({
        where: { userId_questionId: { userId, questionId } },
        update: { answer, score: weight, updatedAt: new Date() },
        create: { userId, questionId, answer, score: weight },
      })
    );
    await db.$transaction(upserts);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const createRiskProfile = async ({
  userId,
  totalScore = 0,
  riskLevel,
  riskPercentage = 0,
  completedAt = new Date(),
  platina_wealth = false,
  consentGiven,
}: {
  userId: string,
  totalScore?: number,
  riskLevel?: RiskLevel,
  riskPercentage?: number,
  completedAt?: Date,
  platina_wealth?: boolean,
  consentGiven: boolean,
}) => {
  try {
    await db.userRiskProfile.upsert({
      where: { userId },
      update: {
        totalScore,
        riskLevel,
        riskPercentage,
        lastUpdated: new Date(),
        consentGiven: consentGiven,
        isAnsweredPlatinaQues: platina_wealth,
      },
      create: {
        userId,
        totalScore,
        riskLevel,
        riskPercentage,
        completedAt,
        lastUpdated: new Date(),
        isAnsweredPlatinaQues: platina_wealth,
        consentGiven: consentGiven,
      },
    });

    return { success: true };
  } catch (error) {
    console.log('Error creating/updating risk profile:', error); 
    return { success: false, message: (error as Error).message };
  }
};
