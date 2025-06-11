'use server';
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { findUser } from "@/lib/data/user";

/**
 * Resets or changes a user's password.
 * @param params
 * - For reset: { identifier, newPassword }
 * - For change: { userId, currentPassword, newPassword }
 */
export const resetPassword = async (
  params:
    | { identifier: string; newPassword: string }
    | { userId: string; currentPassword: string; newPassword: string }
) => {
  try {
    let user;
    if ("userId" in params) {
      user = await db.user.findUnique({ where: { id: params.userId } });
      if (!user) throw new Error("User not found.");

      if (!user.password) throw new Error("User does not have a password set.");

      const isMatch = await bcrypt.compare(params.currentPassword, user.password);
      
      if (!isMatch) throw new Error("Current password is incorrect.");

    } else if ("identifier" in params) {
      user = await findUser(params.identifier);
      if (!user) throw new Error("User not found.");
    }

    const hashedPassword = await bcrypt.hash(params.newPassword, 10);

    await db.user.update({
      where: { id: user!.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Please login with your new password." };
  } catch (error) {
    return { success: false, message: `An error occurred while updating password. ${(error as Error).message}` };
  }
};