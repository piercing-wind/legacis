'use server'
import { db } from "@/lib/db";
import * as z from "zod";
import { Session } from "../session";
import { blogSchema } from "@/lib/schema";


export const createBlog = async (data: z.infer<typeof blogSchema>) => {
  const session = await Session();
  const user = session?.user;

  const categoryArr = data.category
    ? data.category.split(",").map((c) => c.trim()).filter(Boolean)
    : [];
   try {
      // Validate the data against the schema
      const parsedData = blogSchema.parse(data);

      const blogData = {
         id : parsedData.id,
         title: parsedData.title,
         slug: parsedData.slug,
         excerpt: parsedData.excerpt,
         content: parsedData.content, // stringified Delta
         featuredImage: parsedData.featuredImage,
         category: categoryArr,
         status: parsedData.status,
         authorId: user ? user.id : undefined,
         featured: parsedData.featured ?? false,
         published: parsedData.published ?? false,
      }

      let result;
      if (parsedData.id) {
         // Update existing blog
         result = await db.blog.update({
            where: { id: parsedData.id },
            data: blogData,
         });
      } else {
         // Create new blog
         result = await db.blog.create({
            data: blogData,
         });
      }

      
      return {success : true, blog: result};
   } catch (error) {
      return {success : false, error: `Failed to create blog: ${error instanceof Error ? error.message : "Unknown error"}`};
   }

};

export const deleteBlog = async (id: string) => {
  try {
    await db.blog.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to delete blog: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
};