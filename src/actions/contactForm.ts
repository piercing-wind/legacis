"use server";
import { db } from "@/lib/db";

export async function saveContactMessage({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  try {
    await db.contactMessage.create({
      data: {
        name,
        email,
        phone,
        message,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save message." };
  }
}