import { db } from "../db";

export const findAgreementsByServiceId = async (serviceId: string) => {
  const joinRows = await db.serviceAgreement.findMany({
    where: { serviceId },
    include: { agreement: true },
  });
  return joinRows.map(row => row.agreement);
};