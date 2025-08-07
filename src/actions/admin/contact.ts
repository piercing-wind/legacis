"use server";
import { db } from "@/lib/db";

export async function deleteMessage(id: string) {
  await db.contactMessage.delete({ where: { id } });
}