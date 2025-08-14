import { auth } from "@/auth"
import { db } from '@/lib/db'
import { createSubscription } from "@/lib/utils/subscription-service";
import { User } from "next-auth";

export const GET = (request: Request) => {
  return new Response(JSON.stringify({ message: "Restricted Access" }), { status: 200 });
}

export const POST = auth(async (request: any) => {
  try {
    // Check if user is authenticated
    if (!request.auth) throw new Error("Unauthorized");

    const user = request.auth.user;

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      throw new Error("Admin access required");
    }

    const { userId, serviceId, selectedPlan, customPlanDays, customStocks, grantReason } = await request.json();

    // Validate required fields
    if (!userId || !serviceId || !selectedPlan || !grantReason) {
      throw new Error("Missing required fields: userId, serviceId, selectedPlan, and grantReason are required");
    }

    // Validate selectedPlan object
    if (!selectedPlan.id || !selectedPlan.durationInDays || typeof selectedPlan.durationInDays !== 'number') {
      throw new Error("selectedPlan must have valid id and durationInDays");
    }

    // Validate customPlanDays if provided
    if (customPlanDays && (typeof customPlanDays !== 'number' || customPlanDays < 1)) {
      throw new Error("Custom plan days must be a positive number");
    }

    // Validate customStocks if provided
    if (customStocks && (typeof customStocks !== 'number' || customStocks < 1)) {
      throw new Error("Custom stocks must be a positive number");
    }

    // Validate grantReason length
    if (typeof grantReason !== 'string' || grantReason.trim().length < 3) {
      throw new Error("Grant reason must be at least 3 characters long");
    }

    // Verify the plan exists and belongs to the service
    const planExists = await db.servicePlan.findFirst({
      where: {
        id: selectedPlan.id,
        serviceId: serviceId,
        isActive: true
      }
    });

    if (!planExists) {
      throw new Error("Invalid service plan selected");
    }

    const result = await createSubscription({
      userId,
      serviceId,
      selectedPlan,
      grantType: 'ADMIN_GRANTED',
      adminUser: user,
      grantReason: grantReason.trim(),
      customPlanDays: customPlanDays || undefined,
      customStocks: customStocks || undefined
    });

    // Determine what days were actually used
    const actualDays = customPlanDays || selectedPlan.durationInDays;
    
    // Determine what stocks were actually used (for Portfolio Review)
    const actualStocks = customStocks || selectedPlan.stockLimit;

    // Log the admin action for audit trail
   //  console.log(`Admin Grant Access - Admin: ${user.email} granted ${result.service.name} to ${result.user.email} for ${actualDays} days${actualStocks ? ` with ${actualStocks} stocks` : ''}. Value: ₹${result.pricing.finalPrice}. Reason: ${grantReason}`);

    return new Response(JSON.stringify({
      message: 'Access granted successfully',
      data: {
        subscription: result.subscription,
        summary: {
          grantedTo: result.user.name || result.user.email,
          service: result.service.name,
          plan: selectedPlan.label,
          actualDuration: `${actualDays} days`,
          actualStocks: actualStocks || null,
          value: `₹${result.pricing.finalPrice.toLocaleString()}`,
          expiryDate: result.subscription?.expiryDate?.toISOString() || null,
          grantedBy: user.name || user.email,
        }
      }
    }), { status: 200 });

  } catch (error) {
    console.log('Error granting access:', error);
    
    return new Response(
      JSON.stringify({ 
        message: (error as Error).message 
      }), 
      { status: 500 }
    );
  }
});