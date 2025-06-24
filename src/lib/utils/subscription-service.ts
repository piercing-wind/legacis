import { db } from '@/lib/db'
import { calculateFinalPriceSafe } from '@/lib/utils/calculateFinalPrice'
import { GrantType } from '@/prisma/generated/client'
import { TenureDiscount } from '@/types/service'

export interface CreateSubscriptionInput {
  userId: string
  serviceId: string
  planDays: number
  grantType: GrantType
  grantedBy?: string
  grantReason?: string
  paymentId?: string
  couponCode?: string
  couponDiscountPercent?: number
}

export async function createSubscription(input: CreateSubscriptionInput) {
  const { 
    userId, 
    serviceId, 
    planDays, 
    grantType, 
    grantedBy, 
    grantReason, 
    paymentId,
    couponDiscountPercent = 0
  } = input

  // Validate user exists and isn't banned
  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isBanned: true }
  })

  if (!targetUser) {
    throw new Error("User not found")
  }

  if (targetUser.isBanned) {
    throw new Error("Cannot grant access to banned user")
  }

  // Validate service exists and is active
  const service = await db.service.findUnique({
    where: { id: serviceId },
    select: { 
      id: true, 
      name: true, 
      price: true, 
      active: true, 
      type: true,
      taxPercent: true,
      tenureDiscounts: true 
    }
  })

  if (!service) {
    throw new Error("Service not found")
  }

  if (!service.active) {
    throw new Error("Service is not active")
  }

  // Check for existing active subscription
  const existingService = await db.userPurchasedServices.findFirst({
    where: {
      userId,
      serviceId,
      isActive: true,
      expiryDate: { gt: new Date() }
    }
  })

  if (existingService) {
    throw new Error("User already has an active subscription for this service")
  }

  // Calculate pricing
  const serviceData = {
    price: service.price,
    taxPercent: service.taxPercent,
    tenureDiscounts: Array.isArray(service.tenureDiscounts) 
      ? service.tenureDiscounts as TenureDiscount[]
      : null
  }

  const pricingResult = calculateFinalPriceSafe(planDays, serviceData, couponDiscountPercent)

  if (!pricingResult.isValid) {
    throw new Error(`Failed to calculate pricing: ${pricingResult.error}`)
  }

  // Calculate dates
  const purchaseDate = new Date()
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + planDays)

  // Create subscription with appropriate metadata
  const metadata = grantType === 'ADMIN_GRANTED' 
    ? {
        grantedAt: purchaseDate.toISOString(),
        grantedByAdmin: grantedBy ? {
          id: grantedBy,
          name: targetUser.name,
          email: targetUser.email
        } : null,
        grantReason,
        finalPrice: pricingResult.finalPrice,
        grantVersion: "1.0"
      }
    : {
        purchasedAt: purchaseDate.toISOString(),
        paymentId,
        finalPrice: pricingResult.finalPrice,
        purchaseVersion: "1.0"
      }

  const subscription = await db.userPurchasedServices.create({
    data: {
      userId,
      serviceId,
      purchaseDate,
      expiryDate,
      planDays,
      planDiscount: pricingResult.breakdown.planDiscount,
      grantType,
      grantedBy: grantedBy || null,
      grantReason: grantReason || null,
      isActive: true,
      grantMetadata: metadata
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
          price: true, 
          type: true,
          slug: true 
        }
      }
    }
  })

  return {
    subscription,
    pricing: pricingResult,
    service,
    user: targetUser
  }
}