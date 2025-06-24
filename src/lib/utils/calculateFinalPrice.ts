import { TenureDiscount } from "@/types/service";

export interface ServiceData {
  price: number;
  taxPercent?: number | null;
  tenureDiscounts?: TenureDiscount[] | null;
  
}

export interface PricingResult {
  finalPrice: number;
  isValid: boolean;
  error?: string;
  breakdown: {
    planDays: number;
    planMonths: number;
    basePrice: number;
    planDiscount: number;
    planDiscountAmount: number;
    priceAfterPlanDiscount: number;
    couponDiscountPercent: number;
    couponDiscountAmount: number;
    priceAfterAllDiscounts: number;
    taxPercent: number;
    taxAmount: number;
  };
}

/**
 * Safely calculate final price with comprehensive validation
 * @param planDays - Number of days for the plan
 * @param service - Service data with price, taxPercent, and tenureDiscounts
 * @param couponDiscountPercent - Optional coupon discount percentage (0-100)
 * @returns Safe pricing calculation with validation
 */
export function calculateFinalPriceSafe(
  planDays: number, 
  service: ServiceData, 
  couponDiscountPercent: number = 0
): PricingResult {
  try {
    // Input validation
    if (!service || typeof service.price !== 'number' || service.price < 0) {
      return {
        finalPrice: 0,
        isValid: false,
        error: "Invalid service data or price",
        breakdown: getEmptyBreakdown(planDays)
      };
    }

    if (typeof planDays !== 'number' || planDays < 1 || planDays > 3650) {
      return {
        finalPrice: 0,
        isValid: false,
        error: "Plan days must be between 1 and 3650",
        breakdown: getEmptyBreakdown(planDays)
      };
    }

    if (typeof couponDiscountPercent !== 'number' || couponDiscountPercent < 0 || couponDiscountPercent > 100) {
      return {
        finalPrice: 0,
        isValid: false,
        error: "Coupon discount must be between 0 and 100",
        breakdown: getEmptyBreakdown(planDays)
      };
    }

    // Calculate base price
    const planMonths = Math.round(Number(planDays) / 30);
    const basePrice = Math.round(Number(service.price) * planMonths);

    // Safely find plan discount
    let planDiscount = 0;
    if (service.tenureDiscounts && Array.isArray(service.tenureDiscounts)) {
      const matchingPlan = service.tenureDiscounts.find((plan: any) => {
        // Validate each plan object
        return (
          plan &&
          typeof plan === 'object' &&
          typeof plan.days === 'number' &&
          typeof plan.discount === 'number' &&
          plan.days === planDays &&
          plan.discount >= 0 &&
          plan.discount <= 100
        );
      });
      planDiscount = matchingPlan?.discount || 0;
    }

    // Step 1: Apply plan discount (ensure non-negative)
    const planDiscountAmount = Math.round(basePrice * (planDiscount / 100));
    const priceAfterPlanDiscount = Math.max(0, basePrice - planDiscountAmount);

    // Step 2: Apply coupon discount (ensure non-negative)
    const couponDiscountAmount = Math.round(priceAfterPlanDiscount * (couponDiscountPercent / 100));
    const priceAfterAllDiscounts = Math.max(0, priceAfterPlanDiscount - couponDiscountAmount);

    // Step 3: Calculate tax (ensure valid tax percent)
    const taxPercent = Math.max(0, Math.min(100, Number(service.taxPercent || 0)));
    const taxAmount = Math.round(priceAfterAllDiscounts * (taxPercent / 100));
    
    const finalPrice = priceAfterAllDiscounts + taxAmount;

    // Final validation
    if (finalPrice < 0 || !isFinite(finalPrice)) {
      return {
        finalPrice: 0,
        isValid: false,
        error: "Calculated price is invalid",
        breakdown: getEmptyBreakdown(planDays)
      };
    }

    return {
      finalPrice,
      isValid: true,
      breakdown: {
        planDays,
        planMonths,
        basePrice,
        planDiscount,
        planDiscountAmount,
        priceAfterPlanDiscount,
        couponDiscountPercent,
        couponDiscountAmount,
        priceAfterAllDiscounts,
        taxPercent,
        taxAmount
      }
    };

  } catch (error) {
    console.error('Price calculation error:', error);
    return {
      finalPrice: 0,
      isValid: false,
      error: "Calculation failed due to unexpected error",
      breakdown: getEmptyBreakdown(planDays)
    };
  }
}

/**
 * Simple version for when you trust the data (backward compatibility)
 */
export function calculateFinalPrice(
  planDays: number, 
  service: ServiceData, 
  couponDiscountPercent: number = 0
): number {
  const result = calculateFinalPriceSafe(planDays, service, couponDiscountPercent);
  return result.finalPrice;
}

function getEmptyBreakdown(planDays: number) {
  return {
    planDays,
    planMonths: 0,
    basePrice: 0,
    planDiscount: 0,
    planDiscountAmount: 0,
    priceAfterPlanDiscount: 0,
    couponDiscountPercent: 0,
    couponDiscountAmount: 0,
    priceAfterAllDiscounts: 0,
    taxPercent: 0,
    taxAmount: 0
  };
}