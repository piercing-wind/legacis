'use server'

import { db } from "@/lib/db"
export const getAllUsersPurchasedServicesPortfolio = async ({
  search = "",
  status = "ALL",
  skip = 0,
  take = 20,
}: {
  search?: string;
  status?: string;
  skip?: number;
  take?: number;
}) => {
  const where: any = {
    service: { type: "PORTFOLIO_REVIEW" },
  };

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status && status !== "ALL") {
    where.portfolioReview = { status };
  }

  const [items, total] = await Promise.all([
    db.userPurchasedServices.findMany({
      where,
      
      include: {
        servicePlan: true,
        service: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            tag: true,
            type: true,
            features: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        portfolioReview: true,
      },
      orderBy: { purchaseDate: "desc" },
      skip,
      take,
    }),
    db.userPurchasedServices.count({ where }),
  ]);

  return { items, total };
};

export const getPortfolioReviewById = async (id: string) => {
   return await db.portfolioReview.findUnique({
      where: {
         id,
      },
      include: {
         userPurchasedService: {
            include: {
               user: {
                  select: {
                     id: true,
                     name: true,
                     email: true,
                  },
               },
            },
         },
      },
   });
}