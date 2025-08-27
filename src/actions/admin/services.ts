"use server";
import {
  ResearchAdvisoryMutualFundFormSchema,
  ServiceFormSchema,
} from "@/lib/schema";
import { db } from "@/lib/db";
import {
  ResearchAdvisoryModelPortfolioFormSchema,
  ResearchAdvisoryStocksFormSchema,
} from "@/lib/schema";
import { normalizeRationale } from "@/lib/utils";
import { ServiceType } from "@/prisma/generated/client";
import * as z from "zod";

export const serviceUpdate = async (
  data: z.infer<typeof ServiceFormSchema>
) => {
  try {
    // Parse and normalize JSON fields
    const chart = data.chart ? JSON.parse(data.chart) : null;
    const philosophy = data.philosophy ? JSON.parse(data.philosophy) : null;
    const features = data.features ? JSON.parse(data.features) : null;
    const faq = data.faq ? JSON.parse(data.faq) : null;
    const recommendedService = data.recommendedService
      ? data.recommendedService
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const type = data.type as ServiceType;

    const serviceData = {
      name: data.name,
      slug: data.slug,
      order: data.order,
      tag: data.tag,
      label: data.label,
      serviceClass: data.serviceClass,
      description: data.description,
      chart,
      comparisonTitle: data.comparisonTitle,
      philosophy,
      recommendedService,
      taxPercent: data.taxPercent,
      features,
      faq,
      active: data.active,
      type,
      detailMutualFundPageDelta: data.detailMutualFundPageDelta
        ? JSON.parse(data.detailMutualFundPageDelta)
        : null,
      afterPurchaseFeaturesDelta: data.afterPurchaseFeaturesDelta
        ? JSON.parse(data.afterPurchaseFeaturesDelta)
        : null,
      agreements: {
        create: data.agreements.map((agreementId) => ({
          agreement: { connect: { id: agreementId } },
        })),
      },
    };
    // Upsert service
    let result;

    if (data.id) {
      // For updates, handle plans more carefully
      const existingPlansToUpdate = data.plans.filter((plan) => plan.id);
      const newPlansToCreate = data.plans.filter((plan) => !plan.id);

      result = await db.service.update({
        where: { id: data.id },
        data: {
          ...serviceData,
          agreements: {
            deleteMany: {},
            create: data.agreements.map((agreementId) => ({
              agreement: { connect: { id: agreementId } },
            })),
          },
          plans: {
            // Delete plans that are no longer in the form
            deleteMany: {
              id: {
                notIn: existingPlansToUpdate
                  .map((plan) => plan.id!)
                  .filter(Boolean),
              },
            },
            // Update existing plans
            updateMany: existingPlansToUpdate.map((plan) => ({
              where: { id: plan.id! },
              data: {
                label: plan.label,
                durationInDays: plan.durationInDays,
                price: plan.price,
                discount: plan.discount,
                isActive: plan.isActive,
                stockLimit: plan.stockLimit,
              },
            })),
            // Create new plans
            create: newPlansToCreate.map((plan) => ({
              label: plan.label,
              durationInDays: plan.durationInDays,
              price: plan.price,
              discount: plan.discount,
              isActive: plan.isActive,
              stockLimit: plan.stockLimit,
            })),
          },
        },
      });
    } else {
      result = await db.service.create({
        data: {
          ...serviceData,
          plans: {
            create: data.plans.map((plan) => ({
              label: plan.label,
              durationInDays: plan.durationInDays,
              price: plan.price,
              discount: plan.discount,
              isActive: plan.isActive,
              stockLimit: plan.stockLimit,
            })),
          },
        },
      });
    }

    return { success: true, result };
  } catch (error) {
    console.log("Error updating service:", error);
    return {
      success: false,
      message: `An error occurred while updating the service: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const deleteService = async (id: string) => {
  try {
    const res = await db.$transaction(async (tx) => {
      await tx.serviceAgreement.deleteMany({ where: { serviceId: id } });
      return await tx.service.delete({ where: { id } });
    });
    return { success: true, res };
  } catch (error) {
    console.log("Error deleting service:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// This function upserts research advisory stocks
export async function upsertResearchAdvisoryStocks(
  formData: z.infer<typeof ResearchAdvisoryStocksFormSchema>
) {
  // Validate input
  const { stocks } = ResearchAdvisoryStocksFormSchema.parse(formData);
  try {
    const results = await Promise.all(
      stocks.map(async (stock) => {
        // Convert date strings to Date objects if present
        const entryDate = stock.entryDate ? new Date(stock.entryDate) : null;
        const exitDate = stock.exitDate ? new Date(stock.exitDate) : null;

        const stockData = {
          name: stock.name,
          serviceId: stock.serviceId,
          stockTicker: stock.stockTicker,
          sector: stock.sector,
          status: stock.status,
          callType: stock.callType,
          entryPrice: stock.entryPrice,
          targetPrice: stock.targetPrice,
          stopLoss: stock.stopLoss,
          exitPrice: stock.exitPrice,
          rationale: normalizeRationale(stock.rationale),
          exitRationale: normalizeRationale(stock.exitRationale),
          raReport : stock.raReport ?? null,
          entryDate,
          exitDate,
        };

        if (stock.id) {
          return db.researchAdvisoryStockList.update({
            where: { id: stock.id },
            data: stockData,
          });
        } else {
          return db.researchAdvisoryStockList.create({
            data: stockData,
          });
        }
      })
    );

    return { success: true, results };
  } catch (error) {
    console.log("Error upserting research advisory stocks:", error);
    return {
      success: false,
      message: `An error occurred while processing the stocks: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export async function deleteResearchAdvisoryStock(stockId: string) {
  try {
    await db.researchAdvisoryStockList.delete({ where: { id: stockId } });
    return { success: true };
  } catch (error) {
    console.log("Error deleting research advisory stock:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// This function upserts research advisory model portfolio stocks
export async function upsertResearchAdvisoryModelPortfolio(
  formData: z.infer<typeof ResearchAdvisoryModelPortfolioFormSchema>
) {
  // Validate input
  const { stocks } = ResearchAdvisoryModelPortfolioFormSchema.parse(formData);
  try {
    const results = await Promise.all(
      stocks.map(async (stock) => {
        const stockData = {
          name: stock.name,
          serviceId: stock.serviceId,
          stockTicker: stock.stockTicker,
          sector: stock.sector,
          portfolioWeight: stock.portfolioWeight,
          researchReport: stock.researchReport ?? null,
        };

        if (stock.id) {
          return db.researchAdvisoryModelPortfolioStockList.update({
            where: { id: stock.id },
            data: stockData,
          });
        } else {
          // If stock.id is not provided, create a new record
          return db.researchAdvisoryModelPortfolioStockList.create({
            data: stockData,
          });
        }
      })
    );

    return { success: true, results };
  } catch (error) {
    console.log("Error upserting research advisory model portfolio:", error);
    return {
      success: false,
      message: `An error occurred while processing the model portfolio stocks: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export const deleteResearchAdvisoryModelPortfolioStock = async (
  stockId: string
) => {
  try {
    await db.researchAdvisoryModelPortfolioStockList.delete({
      where: { id: stockId },
    });
    return { success: true };
  } catch (error) {
    console.log(
      "Error deleting research advisory model portfolio stock:",
      error
    );
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// This functions upserts research advisory mutual fund stocks
export const upsertResearchAdvisoryMutualFundStocks = async (
  formData: z.infer<typeof ResearchAdvisoryMutualFundFormSchema>
) => {
  const { stocks } = ResearchAdvisoryMutualFundFormSchema.parse(formData);
  try {
    const results = await Promise.all(
      stocks.map(async (stock) => {
        const stockData = {
          name: stock.name,
          serviceId: stock.serviceId,
          category: stock.category,
          weight: stock.weight,
          rationale: normalizeRationale(stock.rationale),
        };

        if (stock.id) {
          return db.researchAdvisoryMutualFundStockList.update({
            where: { id: stock.id },
            data: stockData,
          });
        } else {
          return db.researchAdvisoryMutualFundStockList.create({
            data: stockData,
          });
        }
      })
    );
    return { success: true, results };
  } catch (error) {
    console.log("Error upserting research advisory mutual fund stocks:", error);
    return {
      success: false,
      message: `An error occurred while processing the stocks: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export async function deleteResearchAdvisoryMutualFundStock(stockId: string) {
  try {
    await db.researchAdvisoryMutualFundStockList.delete({
      where: { id: stockId },
    });
    return { success: true };
  } catch (error) {
    console.log("Error deleting research advisory mutual fund stock:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
