'use server'
import { RegisterSchema } from "@/lib/schema"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import * as z from "zod"

export const registerUser = async (data: z.infer<typeof RegisterSchema>) => {
   try {
      const validate = RegisterSchema.safeParse(data)
      if (!validate.success) throw new Error("Invalid data provided.")
      const { name, email, phone, password } = validate.data;
      const hashedPassword = await bcrypt.hash(password, 10);
   
      const baseUsername = email.split("@")[0];
      const currentTimeStamp = Date.now();
      const username = `${baseUsername}_${currentTimeStamp}`;

      const number = Math.floor(Math.random() * 8) + 1;

      const user = await db.user.create({
         data: {
            name,
            email,
            phone,
            password: hashedPassword,
            username: username,
            image: `/profile/user-${number}.png`,
         },
      })
   
      return {user, success : true }
   } catch (error : any) {
      if (error.code === "P2002") {
         return { success: false, message: "A user with this email or phone number already exists." }
      }
      return { success: false, message: `An error occurred during registration. ${error.message}` }

   }
   
}   