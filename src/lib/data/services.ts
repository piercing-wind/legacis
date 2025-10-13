'use server'
import { ComplimentaryService, ResearchAdvisoryModelPortfolioStockList, ResearchAdvisoryMutualFundStockList, ResearchAdvisoryStockList, Service, ServicePlan, ServiceType } from "@/prisma/generated/client";
import { db } from "../db";


export type ServiceWithComplimentary  = Service & {
   plans: ServicePlan[];
   complimentaryService?: {
      id: string;
      slug: string;
      name: string;
      tag: string | null;
      type: ServiceType;
   }[]
} 

// Usage:

// findServices(['MUTUAL_FUNDS', 'COMBO']) — Only these types.
// findServices(undefined, ['MUTUAL_FUNDS', 'COMBO']) — Exclude these types.
// findServices() — All active services.

export const findServices = async (
   types?: ServiceType[],
   excludeTypes?: ServiceType[]
) => {
   const where: any = { active: true };

   if (types && types.length > 0) {
      where.type = { in: types };
   } else if (excludeTypes && excludeTypes.length > 0) {
      where.type = { notIn: excludeTypes };
   }

   const rawServices = await db.service.findMany({
      where,
      orderBy:[
         { order: "asc" }, 
         {createdAt: "desc"},
      ],
      include: {
         plans: true,
         complimentaryService: {
            include: {
               complimentaryService: {
                  select: {
                     id: true,
                     slug: true,
                     name: true,
                     tag: true,
                     type: true,
                  }  
               }
            }
         },
      }
   });

     // Map complimentaryService to expected shape
  return rawServices.map(service => ({
    ...service,
    complimentaryService: service.complimentaryService?.map(cs => cs.complimentaryService)
  }));

}

/**
 * This function finds a service by its ID.
 * @param id - The ID of the service to find, e.g. 'service_id'
 * @returns - Returns the service object if found, otherwise null.
 *  
 */
export const findServiceById = async(id : string)=>{
   return await db.service.findUnique({
      include: {
         plans: true
      },
      where: {
         id,
      },
   })
}

/**
 * This function finds a service by its slug.
 * @param slug - The slug of the service to find, e.g. 'service-1'
 * @returns 
 */
export const findServiceBySlug = async (slug: string) => {
   return await db.service.findUnique({
      where: {
         slug,
      },
      include: {
         plans: true,
         complimentaryService : {
            include: {
               complimentaryService: true,
            },
         }
      },
   });
}

/**
 * This function finds mutliple services by their IDs.
 * @param ids - Array of service IDs to find example ['service-1', 'service-2'] 
 * @returns 
 */
export const findServicesByIds = async (ids: string[]) => {
  const rawServices = await db.service.findMany({
    where: {
      id: { in: ids },
      active: true,
    },
    include: {
      plans: true,
      complimentaryService: {
        include: {
          complimentaryService: {
            select: {
              id: true,
              slug: true,
              name: true,
              tag: true,
              type: true,
            }
          }
        }
      }
    }
  });

  // Flatten to expected shape
  return rawServices.map(service => ({
    ...service,
    complimentaryService: service.complimentaryService?.map(cs => cs.complimentaryService)
  }));
};

/**
 * This function finds a purchased service by user ID and service ID.
 * @param userId - The ID of the user who purchased the service.
 * @param serviceId - The ID of the service that was purchased.
 * @return - Returns the purchased service object if found, otherwise null.
 */
export const isServicePurchased = async (userId: string, serviceId : string) => {
   return await db.userPurchasedServices.findFirst({
      where: {
         userId,
         serviceId,
         expiryDate: {
            gt: new Date(),
         },
         isActive: true,
      },
      include: {
         service: true,
      },
      orderBy: {
         purchaseDate: "desc",
      },
   });
}

export type ComplimentaryServiceWithService =  ComplimentaryService & {
   complimentaryService: {
      id: string;
      slug: string;
      name: string;
      tag: string | null;
      type: ServiceType;
   }
}

export type ServiceData =
  | ResearchAdvisoryStockList[]
  | ResearchAdvisoryModelPortfolioStockList[]
  | ResearchAdvisoryMutualFundStockList[]
  | ComplimentaryServiceWithService[]
  | null;

export const getServiceDataById = async ( serviceId: string, serviceType : ServiceType ): Promise<ServiceData>=>{
   switch (serviceType) {
      case 'RESEARCH_ADVISORY':
         const data = await db.researchAdvisoryStockList.findMany({
            where: {
              serviceId,
            },
         })
         return data;
      case 'RESEARCH_ADVISORY_MODEL_PORTFOLIO':
         return await db.researchAdvisoryModelPortfolioStockList.findMany({
            where: {
               serviceId,
            },
         });
      case 'MUTUAL_FUNDS':
         return await db.researchAdvisoryMutualFundStockList.findMany({
            where: {
               serviceId,
            },
         });
      case 'COMBO':
         return await db.complimentaryService.findMany({
            where: {
               serviceId,
            },
            include:{
               complimentaryService: {
                  select: {
                     id: true,
                     slug: true,
                     name: true,
                     tag: true,
                     type: true,
                  }
               }
            }
         })

      default:
         return Promise.resolve(null);
   }
}


export const getUserPurchasedServiceById = async (userId: string) => {
   return await db.userPurchasedServices.findMany({
      where: {
         userId,
         expiryDate: {
            gt: new Date(),
         },
         isActive: true,
      },
      include: {
         service: {
            select:{
               id : true,
               slug: true,
               name: true,
               tag: true,
               type: true,
            }
         }
      },
      orderBy: {
         purchaseDate: "desc",
      },
   });
}


// Mutual Funds
export const findServiceByCategory = async (category: ServiceType) => {
   return await db.service.findMany({
      where: {
         active: true,
         type: category,
      },
      include: {
         complimentaryService : {
            include: {
               complimentaryService: true,
            },
         },
         plans: true
      },
      orderBy: {
         createdAt: "desc",
      },
   });
}