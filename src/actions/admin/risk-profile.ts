'use server';

import { QuestionFormValues } from "@/components/admin/riskprofile-questions-forms";
import { db } from "@/lib/db";

export const createRiskProfileQuestion = async (data: QuestionFormValues) => {
  try {
    const result = await db.riskProfileQuestion.create({
      data: {
        ...data,
        options: data.options ? JSON.parse(data.options) : null,
      },
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export const updateRiskProfileQuestion = async (id: string, data: QuestionFormValues) => {
  try {
    const result = await db.riskProfileQuestion.update({
      where: { id },
      data: {
        ...data,
        options: data.options ? JSON.parse(data.options) : null,
      },
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};

export const deleteRiskProfileQuestion = async (id: string) => {
  try {
    await db.riskProfileQuestion.delete({
      where: { id },
    });
    return { success: true, message: 'Question deleted successfully' };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}