"use server";
import { db } from "@/lib/db"; // adjust import to your db client
import { RiskLevel } from "@/prisma/generated/client";

type FormData = {
  riskLevel: RiskLevel;
  services: string[];
};

export async function saveRiskLevelRecommendation(data: FormData) {
  try {
    const result = await db.riskLevelServiceRecommendation.upsert({
      where: { riskLevel: data.riskLevel },
      update: { services: data.services },
      create: {
        riskLevel: data.riskLevel,
        services: data.services,
      },
    });
    return { success: true, recommendation: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}