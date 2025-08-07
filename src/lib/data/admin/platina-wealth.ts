import { db } from '@/lib/db';

export interface PlatinaWealthUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  purchaseDate: Date;
  expiryDate: Date;
  isActive: boolean;
  riskProfile: {
    riskLevel: string;
    riskPercentage: number;
    totalScore: number;
  } | null;
  recommendation: {
    id: string;
    portfolioType: string | null;
    userInvestmentAmount: number | null;
    assetAllocation: any;
    stockCount: number;
    lastUpdated: Date;
    isActive: boolean;
  } | null;
}

export interface PlatinaWealthStats {
  totalUsers: number;
  activeUsers: number;
  usersWithRecommendations: number;
  usersWithoutRecommendations: number;
  averageInvestmentAmount: number;
  riskLevelDistribution: {
    CONSERVATIVE: number;
    MODERATE: number;
    AGGRESSIVE: number;
    VERY_AGGRESSIVE: number;
  };
}

export const getPlatinaWealthUsers = async (): Promise<PlatinaWealthUser[]> => {
  try {
    const users = await db.userPurchasedServices.findMany({
      where: {
        service: {
          type: 'PLATINA_WEALTH'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            riskProfile: {
              select: {
                riskLevel: true,
                riskPercentage: true,
                totalScore: true
              }
            },
            platinaRecommendations: {
              select: {
                id: true,
                portfolioType: true,
                userInvestmentAmount: true,
                assetAllocation: true,
                isActive: true,
                updatedAt: true,
                stocks:{
                  select: {
                     purchaseAmount: true,
                  }
                },
                _count: {
                  select: {
                    stocks: {
                      where: {
                        isActive: true
                      }
                    }
                  }
                }
              },
              take: 1,
              orderBy: {
                updatedAt: 'desc'
              }
            }
          }
        }
      },
      orderBy: {
        purchaseDate: 'desc'
      }
    });

  
   // Map each user's data and ensure riskLevel is always a string
    return users.map(purchase => {
      const recommendation = purchase.user?.platinaRecommendations[0];
      const userInvestmentAmount = recommendation?.stocks
        ? recommendation.stocks.reduce((sum, stock) => sum + (stock.purchaseAmount || 0), 0)
        : 0;

      return {
        id: purchase.user?.id || '',
        name: purchase.user?.name || null,
        email: purchase.user?.email || null,
        phone: purchase.user?.phone || null,
        purchaseDate: purchase.purchaseDate,
        expiryDate: purchase.expiryDate || purchase.purchaseDate,
        isActive: purchase.isActive,
        riskProfile: purchase.user?.riskProfile
          ? {
              riskLevel: purchase.user.riskProfile.riskLevel || 'UNKNOWN', // Handle null case
              riskPercentage: purchase.user.riskProfile.riskPercentage,
              totalScore: purchase.user.riskProfile.totalScore,
            }
          : null,
        recommendation: recommendation
          ? {
              id: recommendation.id,
              portfolioType: recommendation.portfolioType,
              userInvestmentAmount, // Assign the calculated investment amount
              assetAllocation: recommendation.assetAllocation,
              stockCount: recommendation._count.stocks,
              lastUpdated: recommendation.updatedAt,
              isActive: recommendation.isActive
            }
          : null
      };
    });
  } catch (error) {
    console.log('Error fetching Platina Wealth users:', error);
    throw error;
  }
};


export const getUserPlatinaDetails = async (userId: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        riskProfile: true,
        platinaRecommendations: {
          include: {
            stocks: {
              orderBy: {
                portfolioWeight: 'desc'
              }
            },
            stockHistory: {
              take: 10,
              orderBy: {
                changeDate: 'desc'
              }
            }
          }
        },
        purchasedServices: {
          where: {
            service: {
              type: 'PLATINA_WEALTH'
            }
          },
          include: {
            service: true
          }
        }
      }
    });

    return user;
  } catch (error) {
    console.log('Error fetching user Platina details:', error);
    throw error;
  }
};