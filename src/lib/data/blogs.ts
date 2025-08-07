'use server'

import { db } from "../db"
type FindBlogsParams = {
  skip?: number;
  take?: number;
  category?: string;
};

export const findBlogs = async ({ skip = 0, take = 10, category }: FindBlogsParams) => {
   return await db.blog.findMany({
      where: {
         published: true,
         status : 'PUBLISHED',
         ...(category ? { category: { has: category } } : {})
      },
      orderBy: {
         createdAt: "desc",
      },
      skip,
      take,
      select:{
         id: true,
         title: true,
         slug: true,
         excerpt: true,
         featuredImage: true,
         featured: true,
         views: true,
         category: true,
         author: {
            select: {
               id: true,
               name: true,
               image: true,
            }
         },
         createdAt: true,
         updatedAt: true,
      }
   })
}

// Get the latest blog (most recent)
export const getLatestBlog = async () => {
  return await db.blog.findFirst({
    where: {
      published: true,
      status: 'PUBLISHED',
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      featured: true,
      views: true,
      category: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      createdAt: true,
      updatedAt: true,
    }
  });
};

// Get recent blogs (excluding the latest one)
export const getRecentBlogs = async (take: number = 5) => {
  return await db.blog.findMany({
    where: {
      published: true,
      status: 'PUBLISHED',
      featured: false, // Exclude featured blogs from recent
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: 1, // Skip the latest blog
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      featured: true,
      views: true,
      category: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      createdAt: true,
      updatedAt: true,
    }
  });
};

// Get featured blogs
export const getFeaturedBlogs = async () => {
  return await db.blog.findMany({
    where: {
      published: true,
      status: 'PUBLISHED',
      featured: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      featured: true,
      views: true,
      category: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      createdAt: true,
      updatedAt: true,
    }
  });
};

export const countBlogs = async (category?: string) => {
  return await db.blog.count({
    where: {
      published: true,
      status: 'PUBLISHED',
      ...(category ? { category: { has: category } } : {}),
    }
  });
};

export const getAllCategories = async () => {
  // Get all categories arrays, flatten, and deduplicate
  const blogs = await db.blog.findMany({
    where: {
      published: true,
      status: 'PUBLISHED',
    },
    select: { category: true },
  });
  // Flatten and deduplicate
  const all = blogs.flatMap(b => b.category ?? []);
  return Array.from(new Set(all)).filter(Boolean);
};


export const findBlogBySlug = async (slug: string) => {
  return await db.blog.findUnique({
    where: {
      slug
    },
    include : {
      author: {
         select: {
            id: true,
            name: true,
            image: true,
         }
      }
    }
   });
}
