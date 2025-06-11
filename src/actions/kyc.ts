"use server";

import * as z from "zod";
import { KYCSchema } from "@/lib/schema";
import { getCashfree } from "@/config/cashfreeConfig";
import { db } from "@/lib/db";

export const verifyPan = async (
  formData: z.infer<typeof KYCSchema>,
  userId: string
) => {
  try {
   const panRequest = {
     verification_id: userId,
     pan: formData.pan,
     name: formData.name,
   };
   const Cashfree = getCashfree();
   //  PAN 360 Cashfree
   const data = panAdvance;
   //  const { data } = await Cashfree.VrsPanAdvanceVerification(panRequest);
   if(data.status !== "VALID") throw new Error(data.message);

   const res = await db.$transaction([
            db.user.update({
              where: {
                id: userId,
              },
              data: {
                 name : data.registered_name,
                 pan: data.pan,
                 dob : data.date_of_birth || formData.dob,
                 aadharNumber: data.aadhaar_linked ? data.masked_aadhaar_number : "",
                 address: data.address?.full_address || formData.address,
                 city: data.address?.city || formData.city,
                 state: data.address?.state || formData.state,
                 zip:  (data.address?.pincode && data.address.pincode !== 0 ? data.address.pincode.toString() : formData.zip),
                 userType : formData.userType,
                 gstin : formData.gstin,
                 panVerified : new Date(),
              },
            }),
           db.panVerificationData.create({
              data: {
                 userId,
                 provider : "CASHFREE",
                 result : JSON.parse(JSON.stringify(data)),
                 status : data.status,
              }
           })
         ]) 

    return {
      success: true,
      message: data.message,
      result: data,
      data: res,
    };
  } catch (error: any) {

   if (error.code === "P2002") {
      if(error.meta?.target?.includes("userId")){
         return {
           success: false,
           message: "You have already completed PAN verification.",
           error,
         };
      }
      if(error.meta?.target?.includes("pan")){
         return {
           success: false,
           message: "This PAN is already associated with another account.",
           error,
         };
      }
    }
    return {
      success: false,
      message: error.message || error.response.data.message || "PAN verification failed",
      error,
    };
  }
};

const data = {
  verification_id: "75df185f-0cbf-4ecf-9cc8-56445b3f609b",
  reference_id: 108633318,
  status: "VALID",
  pan: "MTLPS0588S",
  name: "Saurav Sharma",
  dob: "2001-04-22",
  name_match: "Y",
  dob_match: "Y",
  pan_status: "E",
  aadhaar_seeding_status: "Y",
  aadhaar_seeding_status_desc: "Aadhaar is linked to PAN",
};
const data2 = {
  verification_id: "75df185f-0cbf-4ecf-9cc8-56445b3f609bd",
  reference_id: 108638671,
  status: "VALID",
  pan: "MTLPS0588M",
  name: "SOurabh sharma",
  dob: "2001-05-03",
  name_match: "N",
  dob_match: "N",
  pan_status: "E",
  aadhaar_seeding_status: "Y",
  aadhaar_seeding_status_desc: "Aadhaar is linked to PAN",
};

const panAdvance = {
  reference_id: 108640787,
  verification_id: "75df185f-0cbf-4ecf-9cc8-56445b3f609b-",
  status: "VALID",
  message: "PAN verified successfully",
  name_provided: "SOurabh sharma",
  pan: "MTLPS0588S",
  registered_name: "SAURAV SHARMA",
  name_pan_card: "SAURAV SHARMA",
  first_name: "SAURAV",
  last_name: "SHARMA",
  type: "Individual or Person",
  gender: "MALE",
  date_of_birth: "22-04-2001",
  masked_aadhaar_number: "XXXXXXXX7709",
  email: "",
  mobile_number: "",
  aadhaar_linked: true,
  address: {
    full_address: "",
    street: "",
    city: "",
    state: "",
    pincode: 0,
    country: "India",
  },
  rawPanRequest: "",
  rawPanResponse: "",
};
