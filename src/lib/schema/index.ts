import { AgreementType, BlogStatus, PolicyType, ServiceType } from "@/prisma/generated/client";
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

export const ChangePasswordSchema = z.object({
   currentPassword: z.string().min(8, { message: "Current password must be at least 8 characters long" }).max(50, { message: "Current password cannot exceed 50 characters" }),
   newPassword: z.string().min(8, { message: "New password must be at least 8 characters long" }).max(50, { message: "New password cannot exceed 50 characters" }),
   confirmNewPassword: z.string().min(8, { message: "Confirm new password must be at least 8 characters long" }).max(50, { message: "Confirm new password cannot exceed 50 characters" })
}).refine((data) => data.newPassword === data.confirmNewPassword, {
   message: "New passwords do not match",
})


const ServicePlanSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Label is required"),
  durationInDays: z.number().min(1, "Duration must be at least 1 day"),
  price: z.number().min(0, "Price must be positive"),
  discount: z.number().min(0).max(1).optional(), // 0.1 = 10%, not 100%
  isActive: z.boolean(),
  stockLimit: z.number().min(0).optional().nullable(), // Allow 0 or null
});

// Service Schema
export const ServiceFormSchema = z.object({
  id: z.string().optional(), 
  name: z.string().min(1, { message: "Name is required." }),
  slug: z.string().min(1, { message: "Slug is required." }),
  order: z.coerce.number().min(1, { message: "Order must be at least 1." }),
  tag: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  serviceClass: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  chart: z.string().optional().nullable(), // JSON as string
  comparisonTitle: z.string().optional().nullable(),
  philosophy: z.string().optional().nullable(), // JSON as string
  recommendedService: z.string().optional(),
  taxPercent: z.coerce.number({ invalid_type_error: "Tax percent must be a number." }).optional().nullable(),
  features: z.string().optional().nullable(),
  faq: z.string().optional().nullable(),
  raResearchReport: z.string().optional().nullable(),
  active: z.boolean({ invalid_type_error: "Active must be true or false." }),
  type: z.enum([...(Object.values(ServiceType) as [string, ...string[]])], { message: "Type is required." }),
  agreements: z.array(z.string()).min(1, { message: "At least one agreement is required." }),
  detailMutualFundPageDelta: z.string().optional().nullable(),
  afterPurchaseFeaturesDelta: z.string().optional().nullable(),
  plans: z.array(ServicePlanSchema).min(1, "At least one plan is required"),
});


export type ServiceFormValues = z.infer<typeof ServiceFormSchema>;

// Research Adviosry Stock Schema

export const statusOptions = ["OPEN", "CLOSED"] as const;
export const callTypeOptions = ["BUY", "SELL"] as const;

export const StockSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  serviceId: z.string().min(1, "Service is required"),
  stockTicker: z.string().min(1, "Ticker is required"),
  sector: z.string().optional().nullable(),
  status: z.enum(statusOptions),
  callType: z.enum(callTypeOptions),
  entryPrice: z.coerce.number().nullable().optional(),
  targetPrice: z.coerce.number().nullable().optional(),
  stopLoss: z.coerce.number().nullable().optional(),
  exitPrice: z.coerce.number().nullable().optional(),
  rationale: z.object({ text: z.string().optional() }).optional().nullable(),
  exitRationale: z.object({ text: z.string().optional() }).optional().nullable(),
  entryDate: z.string().nullable().optional(),
  exitDate: z.string().nullable().optional(),
});

export const ResearchAdvisoryStocksFormSchema = z.object({
  stocks: z.array(StockSchema),
});

// Research Advisory Model Portfolio Stock List Schema
export const ResearchAdvisoryModelPortfolioStockSchema = z.object({
  id: z.string().optional(),
  serviceId: z.string().min(1, "Service is required"),
  name: z.string().min(1, "Name is required"),
  stockTicker: z.string().min(1, "Ticker is required"),
  sector: z.string(),
  portfolioWeight: z.coerce.number().min(0, { message: "Portfolio weight must be a positive number" }).max(100, { message: "Portfolio weight cannot exceed 100" }),
  researchReport: z.string().optional().nullable(),
});

export const ResearchAdvisoryModelPortfolioFormSchema = z.object({
  stocks: z.array(ResearchAdvisoryModelPortfolioStockSchema),
});

// Research Advisory Mutual Funds Stock List Schema
export const ResearchAdvisoryMutualFundStockSchema = z.object({
  id: z.string().optional(),
  serviceId: z.string().min(1, "Service is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string(),
  weight: z.coerce.number().min(0, { message: "Portfolio weight must be a positive number" }).max(100, { message: "Portfolio weight cannot exceed 100" }),
  rationale: z.object({ text: z.string().optional() }).optional().nullable()
});

export const ResearchAdvisoryMutualFundFormSchema = z.object({
  stocks: z.array(ResearchAdvisoryMutualFundStockSchema),
});




// In your schema file
export const ComboFormSchema = z.object({
  serviceId: z.string().min(1),
  complimentaryServiceIds: z.array(z.string()),
  complimentaryServices: z.array(z.object({
    serviceId: z.string(),
    planId: z.string().optional(), // Changed from tenure to planId
  })).optional(),
});

export type ComboFormValues = z.infer<typeof ComboFormSchema>;


// Coupon form schema

export const couponSchema = z.object({ 
  id: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  percentOff: z.number().min(0).max(1).optional(), // 0.1 = 10%, not 100%
  expiryDate: z.string().min(1, "Expiry date is required"),
  serviceId: z.string().optional(),
  servicePlanId: z.string().optional(),
});

export type CouponFormValues = z.infer<typeof couponSchema>;


// User form schema
export const userFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional().refine(val => !val || /^\d{10}$/.test(val), {
    message: "Phone number must be 10 digits",
  }),
  username: z.string().optional(),
  image: z.string().optional(),
  dob: z.string().optional(),
  pan: z.string().optional(),
  aadharNumber: z.string().optional(),
  gstin: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  isBanned: z.boolean().optional(),
  userType: z.enum(["INDIVIDUAL", "BUSINESS"]),
  role: z.enum(["USER", "ADMIN"]),
  panVerified: z.string().optional(),
  termsAccepted: z.string().optional(),
  emailVerified: z.string().optional(),
  phoneVerified: z.string().optional(),
  password: z.string().optional(), // Add password as optional
   }).refine(
  (data) => data.id || (!!data.password && data.password.length >= 6),
  {
    message: "Password is required and must be at least 6 characters for new users.",
    path: ["password"],
 });

export type UserFormInput = z.infer<typeof userFormSchema>;


// Blog form schema

export const blogSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().optional(),
  category: z.string().optional(),
  status: z.nativeEnum(BlogStatus),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export type BlogFormValues = z.infer<typeof blogSchema>;


// AGREEMENT form schema

export const agreementSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  content: z.string().min(1, "Content is required"), // You may want to validate JSON structure if needed
  type: z.nativeEnum(AgreementType),
  policyType: z.nativeEnum(PolicyType).optional().nullable(),
  signatoryPerson: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
});

export type AgreementFormValues = z.infer<typeof agreementSchema>;


// Banner form schema
export const bannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  text: z.string().min(1, "Text is required"),
  imageUrl: z.string().optional(),
  buttonLabel: z.string().min(1, "Button label is required"),
  buttonUrl: z.string().min(1, "Button URL is required"),
  bgColor: z.string().optional(),
  isActive: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).superRefine((data, ctx) => {
  // Only check if both dates are present
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      ctx.addIssue({
        path: ["endDate"],
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
      });
    }
  }
});