'use server'
import { db } from "@/lib/db";
import { ResearchAdvisoryModelPortfolioStockList, ResearchAdvisoryMutualFundStockList, ResearchAdvisoryStockList, Service, ServicePlan, ServiceType } from "@/prisma/generated/client";

export const findServices = async () => {
   return await db.service.findMany({
      orderBy: {
         createdAt: "desc",
      },
      select:{
         id : true,
         name: true,
         slug: true,
         order: true,
         tag: true,
         active: true,
         type: true,
         createdAt: true,
         plans : true,
      }
   });
}



export type ServiceWithStocksAndAgreements = Service & {
  plans: ServicePlan[];
  researchAdvisoryStockList?: ResearchAdvisoryStockList[];
  researchAdvisoryModelPortfolioStockList?: ResearchAdvisoryModelPortfolioStockList[];
  researchAdvisoryMutualFundStockList?: ResearchAdvisoryMutualFundStockList[];
  agreements: {
    agreement: {
      id: string;
      name: string;
    };
  }[];
};

export const findServiceById = async (
  id: string
): Promise<ServiceWithStocksAndAgreements | null> => {
  return await db.service.findUnique({
    where: { id },
    include: {
      plans: true,
      researchAdvisoryStockList: true,
      researchAdvisoryModelPortfolioStockList: true,
      researchAdvisoryMutualFundStockList: true,
      agreements: {
        select: {
          agreement: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};