'use server'

import { findUser } from "@/lib/data/user"
import { db } from "@/lib/db"
import { User } from "@/prisma/generated/client"
import bcrypt from "bcryptjs"

export async function changePassword({
  identifier,
  currentPassword,
  newPassword,
}: {
  identifier: string;
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const user: User | null = await findUser(identifier);
    if (!user) throw new Error("This user does not exist");
    if (!user.password)
      throw new Error(
        "It looks like your account was created using Google or another social login. Please use that method to login."
      );

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) throw new Error("Current password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}