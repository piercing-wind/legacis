import { findBlogs, BlogListItem } from "@/lib/data/admin/blogs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatHumanDate } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function Page() {
  const blogs = await findBlogs();

  return (
    <div className="w-full mx-auto overflow-x-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold mb-4">Legacis Blogs</h1>
         <Button variant={'default'} asChild>
            <Link href={`/admin/blog/new`} className="hover:!text-legacisGreen flex items-center gap-2">
              <Plus size={20}/> Add New
            </Link>
         </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.map((blog: BlogListItem, i : number) => (
            <TableRow key={blog.id}>
              <TableCell>{i+1}</TableCell>
              <TableCell className="font-medium">{blog.title}</TableCell>
               <TableCell className="font-medium">
                  <Image
                     src={blog.featuredImage || "/placeholder.png"}
                     alt={blog.title}
                     width={100}
                     height={50}
                     className="rounded-md overflow-clip"
                     style={{ objectFit: "cover" }}
                     loading="lazy"
                  />
               </TableCell>
              <TableCell>{blog.status}</TableCell>
              <TableCell>{blog.published ? "Yes" : "No"}</TableCell>
              <TableCell>{blog.views}</TableCell>
              <TableCell>{formatHumanDate(blog.createdAt)}</TableCell>
              <TableCell>{formatHumanDate(blog.updatedAt)}</TableCell>
              <TableCell>
                <Button variant={'outline'} asChild>
                  <Link href={`/admin/blog/${blog.id}`}>
                     Edit
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default Page;
export const dynamic = "force-dynamic";