'use server';
import { db } from "@/lib/db";
import * as z from "zod";
import { bannerSchema } from "@/lib/schema"; // import your schema

export const upsertBanner = async (data: z.infer<typeof bannerSchema>) => {
  try {
    // Validate the data
    const parsedData = bannerSchema.parse(data);
    // If this banner is being set active, deactivate all others
    if (parsedData.isActive) {
      await db.banner.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    // Convert date strings to Date objects for Prisma
    const startDate = parsedData.startDate ? new Date(parsedData.startDate) : undefined;
    const endDate = parsedData.endDate ? new Date(parsedData.endDate) : undefined;

    const bannerData = {
      title: parsedData.title,
      text: parsedData.text,
      imageUrl: parsedData.imageUrl,
      buttonLabel: parsedData.buttonLabel,
      buttonUrl: parsedData.buttonUrl,
      bgColor: parsedData.bgColor,
      isActive: parsedData.isActive,
      startDate,
      endDate,
    };

    let result;
    if (parsedData.id) {
      // Update existing banner
      result = await db.banner.update({
        where: { id: parsedData.id },
        data: bannerData,
      });
    } else {
      // Create new banner
      result = await db.banner.create({
        data: bannerData,
      });
    }

    return { success: true, banner: result };
  } catch (error) {
    return {
      success: false,
      error: `Failed to upsert banner: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

export const deleteBanner = async (id: string) => {
  try {
    await db.banner.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to delete banner: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
};