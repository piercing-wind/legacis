'use server';
import { db } from "@/lib/db";
import { ServicePlan } from "@/prisma/generated/client";

export type ServiceWithComplimentary = {
  id: string;
  name: string;
  type: string; // Add this field
  plans : ServicePlan[];
  complimentaryService: Array<{
    id: string;
    serviceId: string;
    complimentaryServiceId: string;
      complimentaryPlan: ServicePlan | null; // Include the plan details
    complimentaryService: {
      id: string;
      name: string;
      type: string; // Add this field
      plans: ServicePlan[];
    };
  }>;
};

export async function getAllServices(): Promise<ServiceWithComplimentary[]> {
  return await db.service.findMany({
    select: {
      id: true,
      name: true,
      type: true, // Add this
      plans: true,
      complimentaryService: {
        select: {
          id: true,
          serviceId: true,
          complimentaryServiceId: true,
          complimentaryPlan : true, // Include the plan details
          complimentaryService: {
            select: {
              id: true,
              name: true,
              type: true, // Add this
              plans: true
            }
          }
        }
      }
    }
  });
};