import { Prisma } from "@/prisma/generated/client";
import { db } from "../db";


/**
 * This function finds all combo plan services.
 * @returns
 * Returns an array of combo plan services ordered by creation date in descending order.
 */

export const findComboPlanServices = async () => {
   // return await db.comboPlan.findMany({
   //    orderBy: {
   //       createdAt: "desc",
   //    },
   //    include: {
   //       services: {
   //          include : {
   //             service: true,
   //          }
   //       }, 
   //    }
   // });
}

// export type ComboPlanWithServices = Prisma.ComboPlanGetPayload<{
//   include: {
//     services: {
//       include: {
//         service: true;
//       };
//     };
//   };
// }>;



/**
 * This function finds a combo plan service by its slug.
 * @param slug - The slug of the combo plan service to find, e.g. 'combo-plan-1'
 * @returns 
 */
// export const findComboPlanServiceBySlug = async (slug: string) => {
//    return await db.comboPlan.findUnique({
//       where: {
//          slug,
//       },
//       include: {
//          services: {
//             include : {
//                service: true,
//             }
//          }, 
//       }
//    });
// }

/**
 * This function finds a combo plan service by its ID.
 * @param id - The ID of the combo plan service to find, e.g. 'combo-plan-1'
 * @returns 
 */
// export const findComboPlanServiceById = async (id: string) => {
//    return await db.comboPlan.findFirst({
//       where: {
//          id,
//       }
//    });
// }


// export const findActivePurchasedComboPlanServiceByUserIdAndId = async (userId: string, comboPlanId : string) => {
//    return await db.userPurchasedServices.findFirst({
//       where: {
//          userId,
//          comboPlanId,
//          expiryDate: {
//             gt: new Date(),
//          },
//       },
//       include: {
//          service: true,
//       },
//       orderBy: {
//          purchaseDate: "desc",
//       },
//    });
// }