import { db } from "@/lib/db";
import { Blog } from "@/prisma/generated/client";

// Export the type for the selected fields
export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  featuredImage: string | null;
  status: string;
  published: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
};

export const findBlogs = async (): Promise<BlogListItem[]> => {
  return await db.blog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      featuredImage: true,
      status: true,
      published: true,
      views: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};


export const findBlogById = async (id: string): Promise<Blog | null> => {
   return await db.blog.findUnique({
      where: {
         id,
      }
   });
}