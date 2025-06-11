'use server'
import { auth, signOut } from "@/auth";
import type { Session } from "next-auth";

export async function Session():Promise<Session | null>{
   const session = await auth();
   return session
}

export async function SignOut() {
   await signOut({ redirectTo : '/authenticate' })   
}