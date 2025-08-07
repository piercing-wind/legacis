"use server";
import { db } from "@/lib/db";

export const findUsers = async (
  filter?: { type: "email" | "phone" | "username", value: string },
  skip: number = 0,
  take: number = 20
) => {
  return await db.user.findMany({
    where: filter
      ? { [filter.type]: filter.value }
      : undefined,
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: {
      panVerificationData: true,
    },
  });
};


export const userCount = async () => {
  return await db.user.count();
}

export const findUserById = async (id: string) => {
  return await db.user.findUnique({
    where: { id },
  });
};