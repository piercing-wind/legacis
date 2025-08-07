'use server';

import { db } from "@/lib/db";
import { couponSchema } from "@/lib/schema";
import * as z from "zod";

export const saveCoupon = async (formData: z.infer<typeof couponSchema>) =>  {
   try {
      const parsedData = couponSchema.parse(formData);

      const data = {
         code: parsedData.code,
         description: parsedData.description || null,
        percentOff: typeof parsedData.percentOff === "number" ? parsedData.percentOff : 0, // <-- Ensure number
         expiryDate: new Date(parsedData.expiryDate),
         serviceId: parsedData.serviceId || null,
         servicePlanId: parsedData.servicePlanId || null,
      }
      
      let res;
      if(parsedData.id) {
         res = await db.coupon.update({
            where: { id: parsedData.id },
            data,
         });
      }else {
         res = await db.coupon.create({
            data,
         });
      }

      return { success: true, message: "Coupon saved successfully", res };
      
   } catch (error) {
      console.log("Error saving coupon:", error);
      return { success: false, message: `${(error as Error).message}` };
   }


}