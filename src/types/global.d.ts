declare global {
   type Identifier = "email" | "phone" | "username";
}

declare module "next-auth" {
   interface User {
      id: string;
      role: string;
      email: string;
      phone: string | null;
      username: string | null;
      phoneVerified: Date | null;
      emailVerified: Date | null;
      panVerified: Date | null;
      termsAccepted: Date | null;
      userType: 'INDIVIDUAL' | 'BUSINESS';
      isBanned: boolean;
   }
   interface Session {
      user: {
         id: string;
         role: string;
         email: string;
         phone: string | null;
         username: string | null;
         phoneVerified: Date | null;
         emailVerified: Date | null;
         panVerified: Date | null;
         termsAccepted: Date | null;
         userType: 'INDIVIDUAL' | 'BUSINESS';
      } & DefaultSession["user"];
   }
}

declare module "next-auth/jwt" {
   interface JWT {
      id: string;
      role: string;
      email: string;
      phone: string | null;
      username: string | null;
      phoneVerified: Date | null;
      emailVerified: Date | null;
      panVerified: Date | null;
      termsAccepted: Date | null;
      userType: 'INDIVIDUAL' | 'BUSINESS';
   }
}

export {};

export type PANVerificationResult = {
  reference_id: number;
  verification_id: string;
  status: string;
  message: string;
  name_provided: string;
  pan: string;
  registered_name: string;
  name_pan_card: string;
  first_name: string;
  last_name: string;
  type: string;
  gender: string;
  date_of_birth: string;
  masked_aadhaar_number: string;
  email: string;
  mobile_number: string;
  aadhaar_linked: boolean;
  address: {
    full_address: string;
    street: string;
    city: string;
    state: string;
    pincode: number;
    country: string;
  };
};
