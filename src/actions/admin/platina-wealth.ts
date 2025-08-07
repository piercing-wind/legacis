'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface CreateRecommendationData {
  userId: string;
  portfolioType: string;
  userInvestmentAmount: number;
  assetAllocation: any;
  rationale?: any;
  stocks: {
    stockName: string;
    stockTicker: string;
    sector: string;
    portfolioWeight: number;
    totalShares: number;
    currentSharePrice: number;
    purchaseAmount: number;
    marketValue: number;
    PEratio: number;
    marketCapInCrore: number;
    entryDate: string;
    exitDate?: string;
  }[];
}

export async function createPlatinaRecommendation(data: CreateRecommendationData) {
  try {
    // Get the Platina Wealth service
    const platinaService = await db.servicePlatinaWealth.findFirst({
      include: {
        service: {
          select: {
            id: true
          }
        }
      }
    });

    if (!platinaService) {
      return { success: false, message: 'Platina Wealth service not found' };
    }

    // Check if user has active subscription
    const hasActiveSubscription = await db.userPurchasedServices.findFirst({
      where: {
        userId: data.userId,
        service: {
          type: 'PLATINA_WEALTH'
        },
        isActive: true,
        expiryDate: {
          gt: new Date()
        }
      }
    });

    if (!hasActiveSubscription) {
      return { success: false, message: 'User does not have active Platina Wealth subscription' };
    }

    // Get user's risk profile
    const userRiskProfile = await db.userRiskProfile.findUnique({
      where: { userId: data.userId }
    });

    // Create recommendation with transaction
    const result = await db.$transaction(async (tx) => {
      // Create or update recommendation
      const recommendation = await tx.userPlatinaRecommendation.upsert({
        where: {
          userId_platinaServiceId: {
            userId: data.userId,
            platinaServiceId: platinaService.id
          }
        },
        update: {
          portfolioType: data.portfolioType,
          userInvestmentAmount: data.userInvestmentAmount,
          assetAllocation: data.assetAllocation,
          rationale: data.rationale,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          userId: data.userId,
          platinaServiceId: platinaService.id,
          riskProfileId: userRiskProfile?.id,
          portfolioType: data.portfolioType,
          userInvestmentAmount: data.userInvestmentAmount,
          assetAllocation: data.assetAllocation,
          rationale: data.rationale,
          isActive: true
        }
      });

      // Deactivate existing stocks
      await tx.userPlatinaStockList.updateMany({
        where: {
          recommendationId: recommendation.id,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      // Create new stocks
      const stocksToCreate = data.stocks.map(stock => ({
        recommendationId: recommendation.id,
        ...stock
      }));

      await tx.userPlatinaStockList.createMany({
        data: stocksToCreate
      });

      // Create history entry
      await tx.userPlatinaStockHistory.create({
        data: {
          recommendationId: recommendation.id,
          stockTicker: 'PORTFOLIO',
          stockName: 'Portfolio Update',
          changeType: 'UPDATED',
          changeDescription: `Portfolio updated with ${data.stocks.length} stocks`,
          metadata: {
            stockCount: data.stocks.length,
            totalInvestment: data.userInvestmentAmount
          }
        }
      });

      return recommendation;
    });

    revalidatePath('/admin/platina-wealth');
    return { success: true, message: 'Recommendation created successfully', data: result };

  } catch (error) {
    console.log('Error creating Platina recommendation:', error);
    return { success: false, message: 'Failed to create recommendation' };
  }
}

export async function updateStockInPortfolio(
  recommendationId: string,
  stockId: string,
  updates: Partial<{
    stockName: string;
    stockTicker: string;
    sector: string;
    totalShares: number;
    purchaseAmount: number;
    portfolioWeight: number;
    currentSharePrice: number;
    marketValue: number;
    PEratio: number;
    marketCapInCrore: number;
    exitDate: string;
    isActive: boolean;
  }>
) {
  try {
    const prevStock = await db.userPlatinaStockList.findUnique({
      where: { id: stockId }
    });

    if (!prevStock) {
      return { success: false, message: 'Stock not found' };
    }
    const updatedStock = await db.userPlatinaStockList.update({
      where: { id: stockId },
      data: updates
    });

    // Create history entry
    await db.userPlatinaStockHistory.create({
      data: {
        recommendationId,
        stockTicker: updatedStock.stockTicker,
        stockName: updatedStock.stockName,
        changeType: 'UPDATED',
        changeDescription: `Stock updated: ${Object.keys(updates).join(', ')}`,
        previousWeight: prevStock.portfolioWeight,
        newWeight: updates.portfolioWeight ?? prevStock.portfolioWeight,
        metadata: updates
      }
    });

    revalidatePath('/admin/platina-wealth');
    return { success: true, message: 'Stock updated successfully' };

  } catch (error) {
    console.log('Error updating stock:', error);
    return { success: false, message: 'Failed to update stock' };
  }
}

export async function removeStockFromPortfolio(recommendationId: string, stockId: string) {
  try {
    const stock = await db.userPlatinaStockList.findUnique({
      where: { id: stockId }
    });

    if (!stock) {
      return { success: false, message: 'Stock not found' };
    }

    // Deactivate stock instead of deleting
    await db.userPlatinaStockList.update({
      where: { id: stockId },
      data: { isActive: false }
    });

    // Create history entry
    await db.userPlatinaStockHistory.create({
      data: {
        recommendationId,
        stockTicker: stock.stockTicker,
        stockName: stock.stockName,
        changeType: 'REMOVED',
        changeDescription: `Stock removed from portfolio`,
        previousWeight: stock.portfolioWeight,
        newWeight: 0
      }
    });

    revalidatePath('/admin/platina-wealth');
    return { success: true, message: 'Stock removed successfully' };

  } catch (error) {
    console.log('Error removing stock:', error);
    return { success: false, message: 'Failed to remove stock' };
  }
}

export async function createStockInPortfolio(
  recommendationId: string,
  data: {
    stockName: string;
    stockTicker: string;
    sector: string;
    portfolioWeight: number;
    totalShares: number;
    currentSharePrice: number;
    purchaseAmount: number;
    marketValue: number;
    PEratio: number;
    marketCapInCrore: number;
    isActive: boolean;
    entryDate: string;
    exitDate?: string;
  }
) {
  try {
    const newStock = await db.userPlatinaStockList.create({
      data: {
        recommendationId,
        ...data,
      }
    });

    // Create history entry
    await db.userPlatinaStockHistory.create({
      data: {
        recommendationId,
        stockTicker: newStock.stockTicker,
        stockName: newStock.stockName,
        changeType: 'ADDED',
        changeDescription: `Stock added to portfolio`,
        previousWeight: 0,
        newWeight: newStock.portfolioWeight,
        metadata: data
      }
    });

    revalidatePath('/admin/platina-wealth');
    return { success: true, message: 'Stock added successfully', data: newStock };
  } catch (error) {
    console.log('Error adding stock:', error);
    return { success: false, message: 'Failed to add stock' };
  }
}

export async function updateRecommendationDate({ userId, platinaServiceId, nextRecommendationDate }: { userId: string; platinaServiceId: string; nextRecommendationDate: string }) {
   try{
      await db.userPlatinaRecommendation.update({
         where:{
            userId_platinaServiceId :{
               userId,
               platinaServiceId
            }
         },
         data:{
            nextRecommendationDate : new Date(nextRecommendationDate),
            updatedAt: new Date()
         }
      })
    revalidatePath('/admin/platina-wealth');
    return { success: true, message: 'Recommendation date updated successfully' };
  } catch (error) {
   return { success: false, message: `${(error as Error).message}`};
  }
}


export async function updateUserPlatinaRationale({ userId, platinaServiceId, rationale}:{ userId :string, platinaServiceId: string, rationale: any}){
  try {
   const parsedRationale = typeof rationale === 'string' ? JSON.parse(rationale) : rationale;
    await db.userPlatinaRecommendation.update({
      where: {
          userId_platinaServiceId : {
            userId,
            platinaServiceId,
         }
         },
      data: { rationale : parsedRationale, updatedAt: new Date() }
    });

    revalidatePath('/admin/platina-wealth');
    return { success: true, message: 'Rationale updated successfully' };
  } catch (error) {
    console.log('Error updating rationale:', error);
    return { success: false, message: 'Failed to update rationale' };
  }
}  

export const updateUserPlatinaActiveStatus = async ({platinaServiceId, userId, isActive}:{platinaServiceId : string, userId: string, isActive : boolean}) => {
   try {
      const result = await db.userPlatinaRecommendation.update({
         where : {
            userId_platinaServiceId: {
               userId,
               platinaServiceId,
            },
         },
         data: {
            isActive,
            updatedAt: new Date(),
         }
      })
      revalidatePath('/admin/platina-wealth');
      return { success: true, message: 'Portfolio Activated successfully', data: result };
   } catch (error) {
      console.log('Error Activating Platina portfolio:', error);
      return { success: false, message: 'Failed to Activate portfolio' };
   }
}

export async function updateRecommendationChartData({
  recommendationId,
  chartType,
  chartData,
}: {
  recommendationId: string;
  chartType: 'peChart' | 'epsChart';
  chartData: any;
}) {
  try {
    const result = await db.userPlatinaRecommendation.update({
      where: { id: recommendationId },
      data: { [chartType]: chartData },
    });
    return { success: true, data: result };
  } catch (error) {
   console.log('Error updating chart data:', error);
    return { success: false, message: 'Failed to update chart data' };
  }
}