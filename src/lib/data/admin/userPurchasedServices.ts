import { db } from '@/lib/db';
import { GrantType, ServicePlan, ServiceType } from '@/prisma/generated/client';


// Define and export types
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  createdAt?: Date;
  emailVerified?: Date | null;
  phoneVerified?: Date | null;
}

export interface Service {
  id: string;
  name: string;
  slug?: string;
  type: ServiceType;
  taxPercent: number | null;
  plans?: ServicePlan[];
}

export interface Coupon {
  id: string;
  code: string;
  percentOff: number;
  description?: string | null;
}

export interface GrantMetadata {
  finalPrice?: number;
  pricing?: {
    finalPrice: number;
  };
}

export interface DisplayInfo {
  type: string;
  badge: string;
  iconName: string;
  description: string;
}

export interface UserPurchasedService {
  id: string;
  userId: string;
  serviceId: string;
  servicePlanId?: string | null;
  grantType: GrantType;
  purchaseDate: Date;
  expiryDate: Date | null;
  isActive: boolean;
  grantReason?: string | null;
  grantMetadata?: GrantMetadata | null;
  user: User | null;
  service: Service | null;
  servicePlan?: ServicePlan | null; 
  actualAmountPaid?: number | null;
  couponUsed?: Coupon | null;
  transactionId?: string | null;
  displayInfo: DisplayInfo;
}

export interface UserPurchasedServicesData {
  all: UserPurchasedService[];
  active: UserPurchasedService[];
  expired: UserPurchasedService[];
  stats: {
    total: number;
    activeCount: number;
    expiredCount: number;
  };
}

export interface UserForGrantAccess {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
}

export interface ServiceForGrantAccess {
  id: string;
  name: string;
  price: number;
  type: ServiceType;
  slug: string;
}


const parseGrantMetadata = (metadata: any): GrantMetadata | null => {
  if (!metadata) return null;
  
  try {
    // If it's already an object, return it
    if (typeof metadata === 'object' && metadata !== null) {
      return metadata as GrantMetadata;
    }
    
    // If it's a string, try to parse it
    if (typeof metadata === 'string') {
      return JSON.parse(metadata) as GrantMetadata;
    }
    
    return null;
  } catch (error) {
    console.log('Error parsing grantMetadata:', error);
    return null;
  }
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
} = {}): Promise<UserPurchasedServicesData> => {
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

    const services = await db.userPurchasedServices.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
        servicePlan: true
      },
      orderBy: {
        purchaseDate: "desc",
      },
      skip,
      take,
    });

    // For PURCHASED services, get transaction data
    const purchasedServices = services.filter(s => s.grantType === 'PURCHASED');
    
    const transactions = await db.transaction.findMany({
      where: {
        userId: { in: purchasedServices.map(s => s.userId) },
        serviceId: { in: purchasedServices.map(s => s.serviceId) },
        status: { in: ['completed', 'SUCCESS'] }
      },
      include: {
        coupon: {
          select: {
            id: true,
            code: true,
            percentOff: true,
            description: true
          }
        }
      }
    });

    // Create transaction map
    const transactionMap = new Map();
    transactions.forEach(transaction => {
      const key = `${transaction.userId}-${transaction.serviceId}`;

      if (!transactionMap.has(key) || 
          new Date(transaction.createdAt) > new Date(transactionMap.get(key).createdAt)) {
        transactionMap.set(key, transaction);
      }
    });

    // Enrich services with appropriate data based on grant type
      const enrichedServices: UserPurchasedService[] = services.map(service => {
      const baseData: UserPurchasedService = {
        id: service.id,
        userId: service.userId,
        serviceId: service.serviceId,
        servicePlanId: service.servicePlanId,
        grantType: service.grantType,
        purchaseDate: service.purchaseDate,
        expiryDate: service.expiryDate,
        isActive: service.isActive,
        grantReason: service.grantReason,
        grantMetadata: parseGrantMetadata(service.grantMetadata),
        user: service.user,
        service: service.service,
        servicePlan: service.servicePlan,
        actualAmountPaid: null,
        couponUsed: null,
        transactionId: null,
        displayInfo: getGrantTypeDisplay(service),
      };

      // Only add transaction data for PURCHASED services
      if (service.grantType === 'PURCHASED') {
        const transactionKey = `${service.userId}-${service.serviceId}`;
        const transaction = transactionMap.get(transactionKey);
        
        return {
          ...baseData,
          actualAmountPaid: transaction?.amount || null,
          couponUsed: transaction?.coupon || null,
          transactionId: transaction?.id || null,
        };
      }

      return baseData;
    });

    const now = new Date();
    // Active: isActive AND (no expiry date OR expiry date in future)
    const active = enrichedServices.filter(s => {
      if (!s.isActive) return false;
      if (!s.expiryDate) return true; // Null = lifetime access = always active
      return new Date(s.expiryDate) > now;
    });
    
    // Expired: NOT active OR (has expiry date AND expired)
    const expired = enrichedServices.filter(s => {
      if (!s.isActive) return true;
      if (!s.expiryDate) return false; // Null = lifetime access = never expired
      return new Date(s.expiryDate) <= now;
    });
    
    return {
      all: enrichedServices,
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

// Helper function to get display information based on grant type
export const getGrantTypeDisplay = (service: any) => {
  switch (service.grantType) {
    case 'PURCHASED':
      return {
        type: 'Purchased',
        badge: 'bg-blue-100 text-blue-800',
        iconName: 'CreditCard',
        description: 'User paid for this service'
      };
    case 'COMPLIMENTARY':
      return {
        type: 'Complimentary',
        badge: 'bg-green-100 text-green-800',
        iconName: 'Gift',
        description: 'Free with another service'
      };
    case 'ADMIN_GRANTED':
      return {
        type: 'Admin Granted',
        badge: 'bg-purple-100 text-purple-800',
        iconName: 'Crown',
        description: service.grantReason || 'Manually granted by admin'
      };
    default:
      return {
        type: 'Unknown',
        badge: 'bg-gray-100 text-gray-800',
        iconName: 'HelpCircle',
        description: 'Unknown grant type'
      };
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