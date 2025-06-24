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
              where: {
                isActive: true
              },
              select: {
                id: true,
                portfolioType: true,
                userInvestmentAmount: true,
                assetAllocation: true,
                updatedAt: true,
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

    return users.map(purchase => ({
      id: purchase.user?.id || '',
      name: purchase.user?.name || null,
      email: purchase.user?.email || null,
      phone: purchase.user?.phone || null,
      purchaseDate: purchase.purchaseDate,
      expiryDate: purchase.expiryDate,
      isActive: purchase.isActive,
      riskProfile: purchase.user?.riskProfile || null,
      recommendation: purchase.user?.platinaRecommendations[0] ? {
        id: purchase.user.platinaRecommendations[0].id,
        portfolioType: purchase.user.platinaRecommendations[0].portfolioType,
        userInvestmentAmount: purchase.user.platinaRecommendations[0].userInvestmentAmount,
        assetAllocation: purchase.user.platinaRecommendations[0].assetAllocation,
        stockCount: purchase.user.platinaRecommendations[0]._count.stocks,
        lastUpdated: purchase.user.platinaRecommendations[0].updatedAt
      } : null
    }));

  } catch (error) {
    console.error('Error fetching Platina Wealth users:', error);
    throw error;
  }
};

export const getPlatinaWealthStats = async (): Promise<PlatinaWealthStats> => {
  try {
    const [totalUsers, activeUsers, usersWithRecommendations, riskProfiles] = await Promise.all([
      // Total users with Platina Wealth
      db.userPurchasedServices.count({
        where: {
          service: {
            type: 'PLATINA_WEALTH'
          }
        }
      }),

      // Active users
      db.userPurchasedServices.count({
        where: {
          service: {
            type: 'PLATINA_WEALTH'
          },
          isActive: true,
          expiryDate: {
            gt: new Date()
          }
        }
      }),

      // Users with recommendations
      db.userPlatinaRecommendation.count({
        where: {
          isActive: true,
          user: {
            purchasedServices: {
              some: {
                service: {
                  type: 'PLATINA_WEALTH'
                }
              }
            }
          }
        }
      }),

      // Risk profiles distribution
      db.userRiskProfile.groupBy({
        by: ['riskLevel'],
        _count: {
          riskLevel: true
        },
        where: {
          user: {
            purchasedServices: {
              some: {
                service: {
                  type: 'PLATINA_WEALTH'
                }
              }
            }
          }
        }
      })
    ]);

    // Calculate average investment amount
    const investmentAmounts = await db.userPlatinaRecommendation.aggregate({
      _avg: {
        userInvestmentAmount: true
      },
      where: {
        isActive: true,
        userInvestmentAmount: {
          not: null
        },
        user: {
          purchasedServices: {
            some: {
              service: {
                type: 'PLATINA_WEALTH'
              }
            }
          }
        }
      }
    });

    // Build risk level distribution
    const riskLevelDistribution = {
      CONSERVATIVE: 0,
      MODERATE: 0,
      AGGRESSIVE: 0,
      VERY_AGGRESSIVE: 0
    };

    riskProfiles.forEach(profile => {
      if (profile.riskLevel in riskLevelDistribution) {
        riskLevelDistribution[profile.riskLevel as keyof typeof riskLevelDistribution] = profile._count.riskLevel;
      }
    });

    return {
      totalUsers,
      activeUsers,
      usersWithRecommendations,
      usersWithoutRecommendations: totalUsers - usersWithRecommendations,
      averageInvestmentAmount: investmentAmounts._avg.userInvestmentAmount || 0,
      riskLevelDistribution
    };

  } catch (error) {
    console.error('Error fetching Platina Wealth stats:', error);
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
          where: {
            isActive: true
          },
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
    console.error('Error fetching user Platina details:', error);
    throw error;
  }
};