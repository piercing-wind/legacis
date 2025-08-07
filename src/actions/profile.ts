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

export const updateUserName = async (userId : string, username : string) => {
   try {
      const user = await db.user.update({
         where: { id: userId },
         data: { username },
      });
      return {success: true, user };
   } catch (error) {
      return {success : false, message: `Failed to update username. ${(error as Error).message}`};
   }
}
