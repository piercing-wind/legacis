'use server';
import { db } from "@/lib/db";
import { Session } from "./session";
import { User } from "next-auth";



// This function is no longer used in codebase. 
// Actuall assigning service to user is done with this function.
// function createSubscription from @/src/lib/utils/subscription-service.ts


export const assignServiceToUser = async (serviceId: string) => {
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
          expiryDate : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
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
        },
      });
    });


    return { success: true, message: "Service assigned successfully." };
  } catch (error) {
    return { success: false, message: "Failed to assign service." };
  }
}