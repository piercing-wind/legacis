import { db } from "../db";


export const findComboPlanServiceById = async (id: string) => {
   return await db.comboPlan.findFirst({
      where: {
         id,
      }
   });
}