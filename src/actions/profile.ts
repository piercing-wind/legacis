'use server'
import { db } from "@/lib/db"

export const updateUserProfilePicture = async (userId : string, image : string) => {
   try {
      const user = await db.user.update({
         where: { id: userId },
         data: { image },
      });
      return user;
   } catch (error) {
      return {success : false, message: `Failed to update profile picture. ${(error as Error).message}`};
   }
}