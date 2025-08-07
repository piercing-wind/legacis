import { ServicePlan } from "@/prisma/generated/client";
import { m } from "framer-motion";

export function getServiceDisplayPrice(plans: ServicePlan[]) {
  if (!plans || plans.length === 0) {
    return {
      maxTenure: undefined,
      basePrice: 0,
      discountPercent: 0,
      discountedPrice: 0,
      displayPrice: 0,
    };
  }

  // Find the plan with the maximum durationInDays
  const maxTenure = plans.reduce((max, curr) =>
    curr.durationInDays > max.durationInDays ? curr : max,
    plans[0]
  );

  const price = Number(maxTenure.price || 0);
  const discount = Number(maxTenure.discount || 0);
  const durationInDays = Number(maxTenure.durationInDays || 0);
  const months = durationInDays / 30;

  const discountedPrice = price * (1 - discount);
  const displayPrice = months > 0 ? Math.round(discountedPrice / months) : 0;
  const discountPercent = discount * 100;


  return {
    maxTenure,
    basePrice: price,
    discountPercent,
    discountedPrice,
    displayPrice,
  };
}