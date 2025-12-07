import NextAuth, {User} from "next-auth";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { JWT } from "next-auth/jwt";
import type { Adapter } from "next-auth/adapters";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: {
    ...PrismaAdapter(db),
      async createUser(profile) {
        // This function is called when a new user signs in for the first time from an OAuth (Google) provider. 
        // Generate username from email or name 
         const base =
            profile.email?.split('@')[0] ||
            (profile.name ? profile.name.replace(/\s+/g, '').toLowerCase() : 'user');
         const username = `${base}${Math.floor(Math.random() * 1000)}`;
         const newUser = await db.user.create({
            data: {
              email: profile.email,
              name: profile.name,
              image: profile.image,
              username: username, // Set username at creation
              emailVerified: new Date(), 
            },
         });
      return newUser;
   },
  } as Adapter,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }){
      if(user.isBanned){
         return '/banned'
      }
      return true;
    },

    async jwt({ token, user, account, profile, trigger, session}): Promise<JWT> {
      // console.log("JWT Token1", token);
      if (!token.sub) return token; 

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.username = user.username;
        token.emailVerified = user.emailVerified;
        token.phoneVerified = user.phoneVerified;
        token.panVerified = user.panVerified;
        token.termsAccepted = user.termsAccepted;
        token.userType = user.userType;
        token.isBanned = user.isBanned;
        token.image = user.image;
        token.name = user.name;
        token.email = user.email;
        token.pan = user.pan;
      }

      if (trigger === "update" && session) {
        token.id = session.user.id;
        token.role = session.user.role;
        token.phone = session.user.phone;
        token.username = session.user.username;
        token.emailVerified = session.user.emailVerified;
        token.phoneVerified = session.user.phoneVerified;
        token.panVerified = session.user.panVerified;
        token.termsAccepted = session.user.termsAccepted;
        token.userType = session.user.userType;
        token.isBanned = session.user.isBanned;
        token.image = session.user.image;
        token.name = session.user.name;
        token.email = session.user.email;
        token.pan = session.user.pan;
      }

      return token;
    },
    async session({ session, token, user, newSession, trigger }){
      if(token){
         session.user = {
           ...session.user,
           id: token.id as string,
           role : token.role,
           phone : token.phone,
           username : token.username,
           emailVerified : token.emailVerified,
           phoneVerified : token.phoneVerified,
           panVerified : token.panVerified,
           userType : token.userType,
           isBanned : token.isBanned,
           image : token.image,
           name : token.name,
           email : token.email,
           pan : token.pan,
          };
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  basePath: "/api/auth",
  pages:{
    signIn: '/authenticate', // Displays signin buttons
    error: '/error', // Error code passed in query string as ?error= '
  },
  events:{

  },
  trustHost : true,
  ...authConfig,
});