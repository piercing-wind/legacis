'use server';

import { db } from "@/lib/db";
import * as z from "zod";
import { userFormSchema } from "@/lib/schema";
import bcrypt from "bcryptjs";

export const updateUser = async (formData: z.infer<typeof userFormSchema> ) => {
   try {
      // Validate the form data
      const parsedData = userFormSchema.parse(formData);

      const data = {
         name: parsedData.name,
         email: parsedData.email,
         phone: parsedData.phone ? parsedData.phone : null,
         username: parsedData.username,
         image: parsedData.image,
         dob: parsedData.dob,
         pan: parsedData.pan ? parsedData.pan : null,
         aadharNumber: parsedData.aadharNumber,
         gstin: parsedData.gstin,
         address: parsedData.address,
         state: parsedData.state,
         city: parsedData.city,
         zip: parsedData.zip,
         isBanned: parsedData.isBanned,
         userType: parsedData.userType,
         role: parsedData.role,
      }
      let res;
      if(parsedData.id) {
         res = await db.user.update({
            where: { id: parsedData.id },
            data,
         });
      }else{
         const hashedPassword = await bcrypt.hash(parsedData.password!, 10);
         res = await db.user.create({
            data : {...data, password: hashedPassword},
         });
      }
      return { success: true, message: "User updated successfully", user: res };
   } catch (error : any) {
      if (error.code === "P2002") {
         return { success: false, message: "A user with this email or phone number already exists." }
      }
      console.log("Error updating user:", error);
      return { success: false, message: `Failed to update user: ${(error as Error).message}` };
   }

};