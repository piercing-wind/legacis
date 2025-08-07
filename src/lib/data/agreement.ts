import { db } from "../db";

export const findAgreementsByServiceId = async (serviceId: string) => {
  const joinRows = await db.serviceAgreement.findMany({
    where: {
      serviceId,
      agreement: {
        type: "AGREEMENT",
      },
    },
    include: { agreement: true },
  });
  return joinRows.map((row) => row.agreement);
};
