'use server'
import { ServiceTrading, ServiceType } from "@/prisma/generated/client";
import { db } from "../db";


export const findServices = async () => {
   return await db.service.findMany({
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





export const findActivePurchasedServiceByUserAndService = async (userId: string, serviceId : string) => {
   return await db.userPurchasedServices.findFirst({
      where: {
         userId,
         serviceId,
         expiryDate: {
            gt: new Date(),
         },
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