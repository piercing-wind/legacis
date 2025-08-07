import { db } from "../db";

export const findRiskRecommendations = async ()=>{
   return db.riskLevelServiceRecommendation.findMany();
}


