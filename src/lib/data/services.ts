'use server'
import { ServiceTrading, ServiceType } from "@/prisma/generated/client";
import { db } from "../db";


export const findServices = async () => {
   return await db.service.findMany({
      where: {
         active: true,
      },
      orderBy: {
         createdAt: "desc",
      },
   });
}

/**
 * This function finds a service by its ID.
 * @param id - The ID of the service to find, e.g. 'service_id'
 * @returns - Returns the service object if found, otherwise null.
 *  
 */
export const findServiceById = async(id : string)=>{
   return await db.service.findFirst({
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
         complimentaryService : {
            include: {
               service: true,
            },
         }
      }
   });
}

/**
 * This function finds mutliple services by their slugs.
 * @param slugs - Array of service slugs to find example ['service-1', 'service-2'] 
 * @returns 
 */
export const findServicesBySlugs = async (slugs: string[]) => {
  return await db.service.findMany({
    where: {
      slug: {
        in: slugs,
      },
    },
  });
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


export type ServiceData =
  | ServiceTrading
  | null;

export const getServiceDataById = async ( serviceId: string, serviceType : ServiceType ): Promise<ServiceData>=>{
   switch (serviceType) {
      case 'TRADING':
         return db.serviceTrading.findFirst({
            where: {
              id: serviceId,
            },
         })

      default:
         return Promise.resolve(null);
   }
}