import { db } from '@/lib/db'
import { GrantType, ServiceType } from '@/prisma/generated/client'
import { AgreementSummary } from '@/types/global'
import { User } from 'next-auth'

export interface CreateSubscriptionInput {
  userId: string
  serviceId: string
  selectedPlan?: {
    id: string
    label: string
    durationInDays: number
    price: number
    discount?: number | null
    stockLimit?: number | null
  }
  grantType: GrantType
  adminUser?: User,
  grantReason?: string
  paymentId?: string
  couponCode?: string
  couponDiscountPercent?: number
  customPlanDays?: number
  customStocks?: number
  transactionId?: string
  parentServiceId?: string
}

// Extract pricing calculation to reduce duplication
function calculatePricing(selectedPlan: any, couponDiscountPercent: number, taxPercent: number) {
    if (!selectedPlan) {
    return {
      isValid: true,
      finalPrice: 0,
      breakdown: {
        basePrice: 0,
        planDiscount: 0,
        couponDiscount: 0,
        taxAmount: 0,
        subtotal: 0
      }
    }
  }
  const basePrice = selectedPlan.price
  const planDiscountAmount = selectedPlan.discount 
    ? Math.round(basePrice * selectedPlan.discount) 
    : 0
  const subtotalAfterPlanDiscount = basePrice - planDiscountAmount
  const couponDiscountAmount = Math.round(subtotalAfterPlanDiscount * couponDiscountPercent)
  const subtotal = subtotalAfterPlanDiscount - couponDiscountAmount
  const taxAmount = Math.round(subtotal * ((taxPercent || 0) / 100))
  const finalPrice = subtotal + taxAmount

  return {
    isValid: true,
    finalPrice,
    breakdown: {
      basePrice,
      planDiscount: planDiscountAmount,
      couponDiscount: couponDiscountAmount,
      taxAmount,
      subtotal
    }
  }
}

// Handle service-specific post-creation logic
async function handleServiceSpecificActions(
  serviceType: ServiceType,
  subscription: any,
  service: any,
  targetUser: any
) {
  if (serviceType === ServiceType.PLATINA_WEALTH) {
    const existingRecommendation = await db.userPlatinaRecommendation.findFirst({
      where: {
        userId: targetUser.id,
        platinaServiceId: service.id
      },
    });

    if (existingRecommendation) {
      await db.userPlatinaRecommendation.update({
        where: { id: existingRecommendation.id },
        data: { updatedAt: new Date() },
      });
    } else {
      await db.userPlatinaRecommendation.create({
        data: {
          userId: targetUser.id,
          platinaServiceId: service.id,
          nextRecommendationDate: new Date(),
          isActive: false
        },
      });
    }
  }

  if (serviceType === ServiceType.PORTFOLIO_REVIEW) {
    await db.portfolioReview.create({
      data: {
        userId: targetUser.id,
        userPurchasedServiceId: subscription.id,
        status: 'PENDING_UPLOAD'   
      }
    });
  }
}

export async function createSubscription(input: CreateSubscriptionInput) {
  const { 
    userId, 
    serviceId, 
    selectedPlan,
    grantType, 
    adminUser, 
    grantReason, 
    paymentId,
    couponDiscountPercent = 0,
    customPlanDays,
    customStocks,
    transactionId,
    parentServiceId,
  } = input

  // Validate user exists and isn't banned
  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isBanned: true }
  })

  if (!targetUser) throw new Error("User not found");
  if (targetUser.isBanned) throw new Error("Cannot grant access to banned user");

  // Validate service exists and is active
  const service = await db.service.findUnique({
    where: { id: serviceId },
    select: { 
      id: true, 
      name: true, 
      type: true,
      taxPercent: true,
      plans: {
        where: { isActive: true },
        select: {
          id: true,
          label: true,
          durationInDays: true,
          price: true,
          discount: true,
          stockLimit: true
        }
      }
    }
  });

  if (!service) throw new Error("Service not found");
  
  
  // For PURCHASED services, validate the plan belongs to the service
  if (grantType === 'PURCHASED') {
    if (!selectedPlan) throw new Error("Selected plan is required for purchased services");
    const planExists = service.plans.find(plan => plan.id === selectedPlan.id);
    if (!planExists) throw new Error("Invalid service plan selected");
  }
  
  const isPortfolioReview = service.type === ServiceType.PORTFOLIO_REVIEW;

  let existingService = null;
  
  // For Portfolio Review, skip existing subscription check (one-time service)
  if (!isPortfolioReview) {
    existingService = await db.userPurchasedServices.findFirst({
      where: {
        userId,
        serviceId,
        isActive: true,
        expiryDate: { gt: new Date() }
      }
    });
  }

  // Calculate pricing (unified logic - no more duplication)
  const pricingResult = calculatePricing(selectedPlan, couponDiscountPercent, service.taxPercent || 0);

  // Calculate dates
  const purchaseDate = new Date()
  let expiryDate: Date | null = null // Start with null
  // Determine actual plan days to use
  let actualPlanDays: number;
  let actualStocks: number | null = null;

   // Priority: customPlanDays > selectedPlan.durationInDays > throw error
   if (customPlanDays) {
      actualPlanDays = customPlanDays;
   } else if (selectedPlan?.durationInDays) {
      actualPlanDays = selectedPlan.durationInDays;
   } else {
      throw new Error("Either customPlanDays or selectedPlan with durationInDays is required");
   }

   if (isPortfolioReview) {
      actualStocks = customStocks || selectedPlan?.stockLimit || null;
      // Portfolio Review services don't expire - they're one-time services
      expiryDate = null;
   } else {
      if (existingService?.expiryDate) {
         // Extend from existing expiry date
         expiryDate = new Date(existingService.expiryDate.getTime() + (actualPlanDays * 24 * 60 * 60 * 1000));
      } else {
         // Calculate from current date
         expiryDate = new Date(purchaseDate.getTime() + (actualPlanDays * 24 * 60 * 60 * 1000));
      }

      // Deactivate existing subscription if extending
      if (existingService) {
         await db.userPurchasedServices.update({
            where: { id: existingService.id },
            data: { isActive: false }
         });
      }
   }

   // Create subscription metadata
  const metadata = grantType === GrantType.ADMIN_GRANTED 
    ? {
        grantedAt: purchaseDate.toISOString(),
        grantedByAdmin: adminUser ? {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email
        } : null,
        grantReason,
        finalPrice: pricingResult.finalPrice,
        selectedPlan: selectedPlan ? {
          ...selectedPlan,
          label: isPortfolioReview && actualStocks
            ? `Up to ${actualStocks} Stocks`
            : !isPortfolioReview && customPlanDays
               ? `Custom ${actualPlanDays} days`
               : selectedPlan.label,
          actualDays: actualPlanDays,
          actualStocks
        } : null,
        customPlanDays: customPlanDays || null,
        extendedFrom: existingService?.expiryDate?.toISOString() || null,
        grantVersion: "2.0"
      }
    : {
        purchasedAt: purchaseDate.toISOString(),
        paymentId,
        finalPrice: pricingResult.finalPrice,
        selectedPlan: selectedPlan ? {
          ...selectedPlan,
          label: isPortfolioReview && actualStocks
            ? `Up to ${actualStocks} Stocks`
            : !isPortfolioReview && customPlanDays
               ? `Custom ${actualPlanDays} days`
               : selectedPlan.label,
          actualDays: actualPlanDays,
          actualStocks
        } : null,
        customPlanDays: customPlanDays || null,
        customStocks: customStocks || null,
        extendedFrom: existingService?.expiryDate?.toISOString() || null,
        purchaseVersion: "2.0"
      };

      
  // Create subscription
  const subscription = await db.userPurchasedServices.create({
    data: {
      userId,
      serviceId,
      purchaseDate,
      expiryDate, // This will be null for Portfolio Review
      servicePlanId: selectedPlan?.id || null,
      grantType,
      grantedBy: adminUser?.id || null,
      grantReason: grantReason || null,
      isActive: true,
      grantMetadata: metadata,
      transactionId: transactionId || null,
      parentServiceId: parentServiceId || null,
   },
    
    include: {
      user: {
        select: { 
          id: true, 
          name: true, 
          email: true,
          phone: true 
        }
      },
      service: {
        select: { 
          id: true, 
          name: true, 
          type: true,
          slug: true 
        }
      },
      servicePlan: {
        select: {
          id: true,
          label: true,
          durationInDays: true,
          price: true,
          discount: true,
          stockLimit: true
        }
      }
    }
  });

  // Handle service-specific actions
  await handleServiceSpecificActions(service.type, subscription, service, targetUser);

  return {
    subscription,
    pricing: pricingResult,
    service,
    user: targetUser,
    selectedPlan: {
      ...selectedPlan,
      actualDays: actualPlanDays,
      actualStocks
    },
    actualPlanDays
  };
}