import { db } from "@/lib/db";

export type AgreementIdName = {
  id: string;
  name: string;
  createdAt: Date;
  version: number;
};

export const findAgreementsId_Name = async (): Promise<AgreementIdName[]> => {
   return await db.agreement.findMany({
      where:{
         type: "AGREEMENT",
      },
      orderBy: {
         createdAt: "desc",
      },
      select: {
         id: true,
         name: true,
         version: true,
         createdAt: true,
      }
   });
}

export const findAgreementById = async (id: string) => {
  return await db.agreement.findUnique({
    where: { id },
  });
};