import { db } from "../db";

export const findAgreementById = async (id: string) => {
  return await db.agreement.findUnique({
    where: {
      id: id,
    },
  });
}