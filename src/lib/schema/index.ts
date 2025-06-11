import { stat } from "fs";
import { z } from "zod"

export const RegisterFullSchema = z.object({
  name: z.string().min(2, {message: "Enter a vaild Name"}),
  email: z.string().email({ message: "Enter a valid email address." }),
  phone: z.string().length(10, { message: "Phone number must be 10 digits" }),
  pan: z.string({ required_error: "PAN is required" }),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  city: z.string().optional(),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }).max(50, { message: "Password cannot exceed 50 characters" }),
  confirmPassword: z.string().min(8, { message: "Confirm Password must be at least 8 characters long" }).max(50, { message: "Confirm Password cannot exceed 50 characters" })
}).refine((data) => data.password === data.confirmPassword, {
   message: "Passwords do not match",
   path: ["confirmPassword"],
});

export const RegisterSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email({ message: "Enter a valid email address." }),
  phone: z.string().length(10, { message: "Phone number must be 10 digits" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }).max(50, { message: "Password cannot exceed 50 characters" }),
  confirmPassword: z.string().min(8, { message: "Confirm Password must be at least 8 characters long" }).max(50, { message: "Confirm Password cannot exceed 50 characters" })
}).refine((data) => data.password === data.confirmPassword, {
   message: "Passwords do not match",
   path: ["confirmPassword"],
});


export const LoginSchema = z.object({
   identifier: z.string().min(1, { message: "Enter your email, username, or phone number." }),
   password: z.string().min(8, { message: "Password must be at least 8 characters long" }).max(50, { message: "Password cannot exceed 50 characters" }),
})

export const ForgotPasswordSchema = z.object({
   identifier: z.string().min(1, { message: "Enter your email, username, or phone number." }),
})

export const FormSchema = z.object({
  otp: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

export const NewPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }).max(50, { message: "Password cannot exceed 50 characters" }),
   confirmPassword: z.string().min(8, { message: "Confirm Password must be at least 8 characters long" }).max(50, { message: "Confirm Password cannot exceed 50 characters" })
}).refine((data) => data.password === data.confirmPassword, {
   message: "Passwords do not match",
   path: ["confirmPassword"],
})


export const KYCSchema = z.object({
  name: z.string().min(2, { message: "Enter a valid Name" }),
  pan: z.string().min(9, { message: "Please enter a valid PAN number." }),
  dob: z.string().min(10, { message: "Enter a valid Date of Birth" }),
  state: z.string().min(2, { message: "Enter a valid State" }),
  city: z.string().min(2, { message: "Enter a valid City" }),
  zip: z.string().length(6, { message: "Zip code must be 6 characters" }),
  address: z.string().min(10, { message: "Enter a valid Address" }),
  userType: z.enum(["INDIVIDUAL", "BUSINESS"]),
  gstin: z.string().optional(),
}).refine(
  (data) => data.userType !== "BUSINESS" || (data.gstin && data.gstin.length > 0),
  {
    message: "GSTIN is required for business accounts",
    path: ["gstin"],
  }
);


export const EmailVerificationSchema = z.object({
   email: z.string().email({ message: "Enter a valid email address." }),   
});

export const PhoneVerificationSchema = z.object({
   phone: z.string().length(10, { message: "Phone number must be 10 digits" }),
})

export const OTPSchema = z.object({
   otp: z.string().length(6, { message: "OTP must be 6 digits" }),
})