import BlogForm from "@/components/admin/blog-form";
import { findBlogById } from "@/lib/data/admin/blogs";

async function Page({params}: { params: Promise<{ id: string }>}) {
   const { id } = await params;
   const blog = id === "new" ? null : await findBlogById(id);
   return (
      <div className="p-8 w-full">
         <BlogForm  blog={blog} />
      </div>
   )
}

export default Page;