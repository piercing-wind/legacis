'use server'

import { User } from "@/prisma/generated/client";
import { db } from "../db";
import { identifyInputType } from "../utils";

/**
 * Find a user by their email, phone, or username
 * @param {string} identifier - The email, phone, or username of the user
 * 
 */
export const findUser = async (identifier: string ) : Promise<User | null> => {
   const findby = identifyInputType(identifier);
   switch (findby) {
      case "email":
         return await db.user.findFirst({
            where: {
               email: identifier,
            },
         });
      case "phone":
         return await db.user.findFirst({
            where: {
               phone: identifier,
            },
         });
      case "username":
         return await db.user.findFirst({
            where: {
               username: identifier,
            },
         });
   }
}

/**
 * Find a user by their ID
 * @param {string} id - The ID of the user
 */
export const findUserById = async (id: string) : Promise<User | null> => {
   return await db.user.findFirst({
      where: {
         id: id,
      },
   });
}

/**
 * Update the email of a user by their ID
 * @param {string} id - The ID of the user
 * @param {string} email - The new email address
 */
export const updateEmailAndVerifyById = async (id: string, email: string) : Promise<User | null> => {
   return await db.user.update({
      where: {
         id: id,
      },
      data: {
         email: email,
         emailVerified: new Date(),
      },
   });
}

/**
 * Mark a user's email as verified by their ID
 * @param {string} id - The ID of the user
 */
export const markEmailVerifiedById = async (id: string): Promise<User | null> => {
   return await db.user.update({
      where: { id },
      data: { emailVerified: new Date() },
   });
};

/**
 * Update the phone of a user by their ID
 * @param {string} id - The ID of the user
 * @param {string} phone - The new phone number
 */
export const updatePhoneAndVerifyById = async (id: string, phone: string) : Promise<User | null> => {
   return await db.user.update({
      where: {
         id: id,
      },
      data: {
         phone: phone,
         phoneVerified: new Date(),
      },
   });
}

/**
 * Mark a user's phone as verified by their ID
 * @param {string} id - The ID of the user
 */
export const markPhoneVerifiedById = async (id: string): Promise<User | null> => {
   return await db.user.update({
      where: { id },
      data: { phoneVerified: new Date() },
   });
}


/**
 * Update the user's terms acceptance date
 * @param {string} id - The ID of the user
 */
export const updateTermsAcceptedById = async (id: string): Promise<User | null> => {
   return await db.user.update({
      where: { id },
      data: { termsAccepted: new Date() },
   });
}


export const getUserTransactions = async (userId: string) => {
   return await db.transaction.findMany({
      where: { userId: userId },
      include: { 
         service: true, 
         comboPlan: true,
      },
      orderBy: { createdAt: "desc" },
   });
}