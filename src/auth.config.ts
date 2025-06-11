import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { LoginSchema } from "./lib/schema";
import { findUser } from "./lib/data/user";
import bcrypt from "bcryptjs";

export default {
   providers :[
      Credentials({
         async authorize(credentials) {
            try {
               const validateFields = LoginSchema.safeParse(credentials)
               if (validateFields.success){
                  const {identifier, password} = validateFields.data;
                  const user = await findUser(identifier);
                  if (!user || !user.password) return null;
                  const passwordMatch = await bcrypt.compare(password, user.password);
                  if (passwordMatch) return user;
               }
               return null;
            }catch (error) {
               return null;
            }
         }
      }),
      Google({
         
      })
   ]
}