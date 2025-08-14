import { db } from '@/lib/db';
import type { Prisma } from '@/prisma/generated/client';

type SubscriptionInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
      emailVerified: true,
      phoneVerified: true  
    };
  };
  service: {
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      taxPercent: true,
      plans: true,
    };
  };
  transaction: {
    include: {
      transactionAgreements: {
         include : {
            agreement: true, // Include the actual agreement details
         }
      },
      aadhaarOtp: true,
      coupon: {
        select: {
          id: true,
          code: true,
          percentOff: true,
          description: true
        };
      };
    };
  };
  servicePlan: true;
};
export type UserPurchasedWithRelations = Prisma.UserPurchasedServicesGetPayload<{ include: SubscriptionInclude }>;

export type AllUserPurchasedServices = {
  all: UserPurchasedWithRelations[];
  active: UserPurchasedWithRelations[];
  expired: UserPurchasedWithRelations[];
  stats: {
    total: number;
    activeCount: number;
    expiredCount: number;
  };
};

export const findAllUserPurchasedServices = async ({
  search = "",
  serviceType = "ALL",
  skip = 0,
  take = 20,
}: {
  search?: string;
  serviceType?: string;
  skip?: number;
  take?: number;
} = {}) : Promise<AllUserPurchasedServices>   => {
  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { service: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (serviceType && serviceType !== "ALL") {
      // Correct: filter by related service.type
      where.service = { ...(where.service || {}), type: serviceType };
    }
    
    // 1. Get total count of matching records (without pagination)
    const total = await db.userPurchasedServices.count({ where });

    const subscriptions = await db.userPurchasedServices.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            createdAt: true,
            emailVerified: true,
            phoneVerified: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            taxPercent: true,
            plans: true
          },
        },
         transaction: {
          include: {
            transactionAgreements: {
               include : {
                  agreement: true, // Include the actual agreement details
               }
            },
            aadhaarOtp: true,
            coupon: {
              select: {
                id: true,
                code: true,
                percentOff: true,
                description: true
              }
            }
          }
        },
        servicePlan: true
      },
      orderBy: {
        purchaseDate: "desc",
      },
      skip,
      take,
    });

    const now = new Date();
    const active = subscriptions.filter(s => s.isActive && (!s.expiryDate || new Date(s.expiryDate) > now));
    const expired = subscriptions.filter(s => !s.isActive || (s.expiryDate && new Date(s.expiryDate) <= now));

   
   return {
     all: subscriptions,
     active,
     expired,
     stats: {
       total,
       activeCount: active.length,
       expiredCount: expired.length
     }
   };

   } catch (error) {
      console.log('Error fetching user purchased services:', error);
      throw error;
   }
};



export const getUsersForGrantAccess = async () => {
  try {
    const users = await db.user.findMany({
      where: {
        role: 'USER', // Only regular users, not admins
        isBanned: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return users
  } catch (error) {
    console.log('Error fetching users for grant access:', error)
    throw error
  }
}

export const getServicesForGrantAccess = async () => {
  try {
    const services = await db.service.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        slug: true,
        plans: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return services
  } catch (error) {
    console.log('Error fetching services for grant access:', error)
    throw error
  }
}