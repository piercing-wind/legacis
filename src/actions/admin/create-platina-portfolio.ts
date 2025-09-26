"use server";
import { db } from "@/lib/db";

export async function createPlatinaPortfolio(userId: string, platinaServiceId: string) {
   try {
      const newPortfolio = await db.userPlatinaRecommendation.create({
         data: {
            userId,
            platinaServiceId,
            isActive: false,
         }
      })
      return { success: true, message: "Platina portfolio created successfully.", portfolio: newPortfolio };
   } catch (error) {
      console.error("Error creating Platina portfolio:", error);
      return { success: false, message: "Failed to create Platina portfolio." };
   }
}