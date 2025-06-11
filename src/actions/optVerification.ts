'use server'
import { OTPEmail } from "@/emails/template";
import { sendMail } from "@/emails/sendmail";
import { db } from "@/lib/db";
import { identifyInputType } from "@/lib/utils";
import { findUser, markEmailVerifiedById, markPhoneVerifiedById, updateEmailAndVerifyById, updatePhoneAndVerifyById, updateTermsAcceptedById } from "@/lib/data/user";
import { Session } from "./session";
import { User } from "next-auth";
import { VerificationType } from "@/prisma/generated/client";


const OTP_EXPIRY_MS = 10 * 60 * 1000; // 3 minutes
const OTP_RATE_LIMIT_MS = 2 * 60 * 1000; // 2 minutes

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendOTP = async ({ identifier, verificationType }: { identifier: string, verificationType : VerificationType}) => {
  try {
    const session = await Session();
    let user: User | null = session?.user ?? null;
    const input_type = identifyInputType(identifier);

    let userId: string;

    if (user) {
      userId = user.id;
    } else {
      user = await findUser(identifier);
      if (!user) throw new Error("User not found.");
      userId = user.id;
    }

    // Rate limit check
    const recentOtp = await db.otp.findUnique({
      where: { userId_identifier_verificationType: { userId, identifier, verificationType } }
    });

    if (recentOtp && recentOtp.createdAt > new Date(Date.now() - OTP_RATE_LIMIT_MS)) {
      throw new Error("You can only request a new OTP after 2 minutes.");
    }

    const OTP = generateOTP();

    if (input_type === 'email') {
      const data = {
        name: user.name ?? "",
        otp: OTP,
        year: new Date().getFullYear(),
      };
       let subject = "Verification Code - Legacis";
      switch (verificationType) {
        case "EMAIL_VERIFY":
          subject = "Email Verification Code - Legacis";
          break;
        case "PHONE_VERIFY":
          subject = "Phone Verification Code - Legacis";
          break;
        case "EMAIL_UPDATE":
          subject = "Email Update Code - Legacis";
          break;
        case "PHONE_UPDATE":
          subject = "Phone Update Code - Legacis";
          break;
        case "RESET_PASS_VERIFY":
          subject = "Password Reset Code - Legacis";
          break;
        case "CONSENT":
          subject = "Consent Verification Code - Legacis";
          break;
      } 
      await sendMail({
        to: identifier,
        subject: subject,
        template: 'otp',
        context: data,
      });
    }
    if (input_type === 'phone') {
      // send sms logic here
    }

    await db.otp.upsert({
      where: { userId_identifier_verificationType: { userId, identifier, verificationType }},
      update: {
        otp: OTP,
        expires_at: new Date(Date.now() + OTP_EXPIRY_MS),
        createdAt: new Date(),
      },
      create: {
        userId,
        identifier,
        otp: OTP,
        verificationType,
        expires_at: new Date(Date.now() + OTP_EXPIRY_MS),
      },
    });

    return { success: true, message: `Code sent successfully to ${identifier}. Valid for 10 minutes.` };
  } catch (error) {
    console.log("Error sending OTP:", error);
    return { success: false, message: (error as Error).message };
  }
};


export const verifyOTP = async ({identifier, otp}:{identifier : string, otp: string})=>{ 
   try {

      const otpRecord = await db.otp.findFirst({
          where: { identifier, otp },
          orderBy: { createdAt: 'desc' }
        });
      console.error("Error verifying OTP:")
      if (!otpRecord) {
         throw new Error("Invalid or expired OTP, please request a new one.");
      }

      if (otpRecord.expires_at < new Date()) {
         await db.otp.delete({ where: { id: otpRecord.id } });
         throw new Error("OTP has expired, please request a new one.");
      }

      if (otpRecord.otp !== otp) {
         throw new Error("Invalid OTP, please try again.");
      }

      let res;
      let message = "OTP verified successfully";
      if (
         otpRecord.verificationType === "EMAIL_UPDATE" ||
         otpRecord.verificationType === "PHONE_UPDATE" ||
         otpRecord.verificationType === "EMAIL_VERIFY" ||
         otpRecord.verificationType === "PHONE_VERIFY" ||
         otpRecord.verificationType === "CONSENT"
       ) {
         const session = await Session();
         const user: User | undefined = session?.user;
         if (!user) {
           throw new Error("User session not found.");
         }
   
         switch (otpRecord.verificationType) {
           case "EMAIL_UPDATE":
             res = await updateEmailAndVerifyById(user.id, otpRecord.identifier);
             message = "Email updated and verified successfully";
             break;
           case "PHONE_UPDATE":
             res = await updatePhoneAndVerifyById(user.id, otpRecord.identifier);
             message = "Phone number updated and verified successfully";
             break;
           case "EMAIL_VERIFY":
             res = await markEmailVerifiedById(user.id);
             message = "Email verified successfully";
             break;
           case "PHONE_VERIFY":
             res = await markPhoneVerifiedById(user.id);
             message = "Phone number verified successfully";
             break;
           case 'CONSENT':
            res = await updateTermsAcceptedById(user.id)
            message = "Consent accepted successfully";
            break;
         }
       }
   
      
         await db.otp.delete({ where: { id: otpRecord.id } });

      return { success: true, message, res}
   } catch (error) {
      console
      return { success: false, message: (error as Error).message }
   }
}
