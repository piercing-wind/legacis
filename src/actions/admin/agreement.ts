"use server";
import { db } from "@/lib/db";
import { agreementSchema, AgreementFormValues } from "@/lib/schema";
import crypto from "crypto";


function generateHash(content: any) {
  const str = typeof content === "string" ? content : JSON.stringify(content);
  return crypto.createHash("sha256").update(str).digest("hex");
}

export const upsertAgreement = async (data: AgreementFormValues) => {
   try {
      const parsed = agreementSchema.safeParse(data);
      if (!parsed.success) return { success: false, error: parsed.error.flatten() };
      
      let version = 1;
      
      if (data.id) {
         // Find the latest version for this agreement
         const latest = await db.agreement.findFirst({
            where: { id: data.id },
         });
         if (latest && latest.type !== parsed.data.type) {
            return { success: false, error: "Cannot change type of an existing agreement or policy." };
         }
         if (latest) {
            version = latest.version + 1;
         }
      }

      const hash = generateHash(data.content);

      const agreementData = {
         name: data.name,
         content: data.content,
         version: version,
         hash: hash,
         type: data.type,
         policyType: data.policyType ?? null,
         signatoryPerson: data.signatoryPerson ?? null,
         companyName: data.companyName ?? null,
      }

      // Always create a new record (never update)
      if (parsed.data.type === 'AGREEMENT') {
         // Always create new for agreement
         const result = await db.agreement.create({ data: agreementData });
         return { success: true, agreement: result };
      } else {
         // For policy or others: update if id, else create
         if (data.id) {
            const result = await db.agreement.update({
               where: { id: data.id },
               data: agreementData,
            });
         return { success: true, agreement: result };
         } else {
            const result = await db.agreement.create({ data: agreementData });
            return { success: true, agreement: result };
         }
      }
   } catch (error) {
      return { success: false, error: `Failed to save agreement: ${error instanceof Error ? error.message : "Unknown error"}` };
   }
};

export const deletePolicy = async (id: string) => {
  try {
    await db.agreement.delete({ where: { id, type: "POLICY" } });
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to delete policy: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
};