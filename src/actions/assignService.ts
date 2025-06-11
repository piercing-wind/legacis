'use server';
import { db } from "@/lib/db";
import { Service } from "@/prisma/generated/client";
import { Session } from "./session";
import { User } from "next-auth";
import { TenureDiscount } from "@/types/service";

export const assignServiceToUser = async (serviceId: string, plan : TenureDiscount) => {
  try {
   const session = await Session();
   const user = session?.user as User;
   if (!user || !user.id) throw new Error("User not authenticated.");

   const userId = user.id;
   // Assign the service to the user


    await db.$transaction(async (tx) => {
      const purchase = await tx.userPurchasedServices.create({
        data: {
          userId,
          serviceId,
          purchaseDate: new Date(),
          expiryDate : new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000),
          status: "ACTIVE",
          planDays : plan.days,
          planDiscount : plan.discount,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          serviceId,
          amount: 1999,
          currency: "INR",
          status: "SUCCESS",
          paymentGateway: "razorpay",
          paymentId: "payment_123456",
          orderId: "123456",
          userPurchasedServicesId: purchase.id, 
        },
      });
    });


    return { success: true, message: "Service assigned successfully." };
  } catch (error) {
    console.error("Error assigning service:", error);
    return { success: false, message: "Failed to assign service." };
  }
}