import { db } from '@/lib/db';
import { GrantType, ServiceType } from '@/prisma/generated/client';


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
  price: number;
  type: ServiceType;
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
  grantType: GrantType;
  planDays: number;
  planDiscount: number;
  purchaseDate: Date;
  expiryDate: Date;
  isActive: boolean;
  grantReason?: string | null;
  grantMetadata?: GrantMetadata | null;
  user: User | null;
  service: Service | null;
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
    console.error('Error parsing grantMetadata:', error);
    return null;
  }
};

export const findAllUserPurchasedServices = async (): Promise<UserPurchasedServicesData> => {
  try {
    const services = await db.userPurchasedServices.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            emailVerified: true,
            phoneVerified: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            type: true
          }
        }
      },
      orderBy: {
        purchaseDate: 'desc'
      }
    });

    // For PURCHASED services, get transaction data
    const purchasedServices = services.filter(s => s.grantType === 'PURCHASED');
    
    const transactions = await db.transaction.findMany({
      where: {
        userId: { in: purchasedServices.map(s => s.userId) },
        serviceId: { in: purchasedServices.map(s => s.serviceId) },
        status: 'completed'
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
        grantType: service.grantType,
        planDays: service.planDays,
        planDiscount: service.planDiscount,
        purchaseDate: service.purchaseDate,
        expiryDate: service.expiryDate,
        isActive: service.isActive,
        grantReason: service.grantReason,
        grantMetadata: parseGrantMetadata(service.grantMetadata),
        user: service.user,
        service: service.service,
        actualAmountPaid: null,
        couponUsed: null,
        transactionId: null,
        displayInfo: getGrantTypeDisplay(service)
      };

      // Only add transaction data for PURCHASED services
      if (service.grantType === 'PURCHASED') {
        const transactionKey = `${service.userId}-${service.serviceId}`;
        const transaction = transactionMap.get(transactionKey);
        
        return {
          ...baseData,
          actualAmountPaid: transaction?.amount || null,
          couponUsed: transaction?.coupon || null,
          transactionId: transaction?.id || null
        };
      }

      return baseData;
    });

    const now = new Date();
    const active = enrichedServices.filter(s => s.isActive && new Date(s.expiryDate) > now);
    const expired = enrichedServices.filter(s => !s.isActive || new Date(s.expiryDate) <= now);

    return {
      all: enrichedServices,
      active,
      expired,
      stats: {
        total: enrichedServices.length,
        activeCount: active.length,
        expiredCount: expired.length
      }
    };

  } catch (error) {
    console.error('Error fetching user purchased services:', error);
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
    console.error('Error fetching users for grant access:', error)
    throw error
  }
}

export const getServicesForGrantAccess = async () => {
  try {
    const services = await db.service.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        type: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return services
  } catch (error) {
    console.error('Error fetching services for grant access:', error)
    throw error
  }
}