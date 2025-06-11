'use server'
import * as z from "zod"
import { LoginSchema } from "@/lib/schema"
import { findUser } from "@/lib/data/user"
import { AuthError } from "next-auth"
import { signIn } from "@/auth"
import bcrypt from "bcryptjs"

export const login = async (data : z.infer<typeof LoginSchema>) => {
   try {
      const {identifier, password} = data
      const validate = LoginSchema.safeParse(data)
      if(!validate.success) throw new Error(validate.error.issues[0].message);
   
      const user = await findUser(identifier);
      if(!user) throw new Error("This user does not exist");
      if(!user.password) throw new Error("It looks like your account was created using Google or another social login. Please use that method to log in.");
      const passwordMatch = await bcrypt.compare(password, user.password);
      if(!passwordMatch) throw new Error("Invalid email or password");

      await signIn("credentials", {
         identifier: identifier,
         password,
         redirect: false,
      })
      return {success: true, message: "Logged in successfully!"}

   } catch (error) {
      if (error instanceof AuthError) {
         switch (error.type) {
           case "CredentialsSignin":
             return {success: false, message: `Invalid Email or Password` };
           case "OAuthCallbackError":
             return {success: false, message: "Access Denied" };
           default:
             return {success: false, message: "Something went wrong!" };
         }
      }
   
      return {success: false, message: `An error occurred while logging in. ${(error as Error).message}.`}
   
   }
}