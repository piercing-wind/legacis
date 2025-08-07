"use server";

import { db } from "@/lib/db";

// Update the type to match what the form is sending
type ComboFormData = {
  serviceId: string;
  complimentaryServices: Array<{
    serviceId: string;
    planId?: string; // Changed from tenure to planId
  }>;
};

export async function attachComplimentaryServices(formData: ComboFormData) {
  // Basic validation
  if (!formData.serviceId || !Array.isArray(formData.complimentaryServices)) {
    return { success: false, message: "Invalid data" };
  }

  try {
    // Remove existing complimentary services for this service
    await db.complimentaryService.deleteMany({
      where: { serviceId: formData.serviceId },
    });

    // Add new complimentary services with tenure
    if (formData.complimentaryServices.length > 0) {
      await db.complimentaryService.createMany({
        data: formData.complimentaryServices.map(comp => ({
          serviceId: formData.serviceId,
          complimentaryServiceId: comp.serviceId,
          complimentaryServicePlanId: comp.planId || null, // Use planId or null if not provided
        })),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error attaching complimentary services:", error);
    return { success: false, message: "Database error" };
  }
}