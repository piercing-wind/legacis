import { auth } from "@/auth"
import { db } from '@/lib/db'
import { calculateFinalPriceSafe } from "@/lib/utils/calculateFinalPrice";
import { createSubscription } from "@/lib/utils/subscription-service";
import { TenureDiscount } from "@/types/service";

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

    const { userId, serviceId, planDays, grantReason } = await request.json();

    // Validate required fields
    if (!userId || !serviceId || !planDays || !grantReason) {
      throw new Error("Missing required fields: userId, serviceId, planDays, and grantReason are required");
    }

    // Validate planDays is a positive number
    if (typeof planDays !== 'number' || planDays < 1) {
      throw new Error("Plan days must be a positive number");
    }

    // Validate grantReason length
    if (typeof grantReason !== 'string' || grantReason.trim().length < 3) {
      throw new Error("Grant reason must be at least 3 characters long");
    }

    const result = await createSubscription({
      userId,
      serviceId,
      planDays,
      grantType: 'ADMIN_GRANTED',
      grantedBy: user.id,
      grantReason: grantReason.trim()
    })
    // Log the admin action for audit trail
    console.log(`Admin Grant Access - Admin: ${user.email} granted ${result.service.name} to ${result.user.email} for ${planDays} days. Value: ₹${result.pricing.finalPrice}. Reason: ${grantReason}`)

    return new Response(JSON.stringify({
      message: 'Access granted successfully',
      data: {
        subscription: result.subscription,
        summary: {
          grantedTo: result.user.name || result.user.email,
          service: result.service.name,
          duration: `${planDays} days`,
          value: `₹${result.pricing.finalPrice.toLocaleString()}`,
          expiryDate:result.subscription.expiryDate.toISOString(),
          grantedBy: user.name || user.email,
        }
      }
    }), { status: 200 });

  } catch (error) {
    console.error('Error granting access:', error);
    
    return new Response(
      JSON.stringify({ 
        message: (error as Error).message 
      }), 
      { status: 500 }
    );
  }
});