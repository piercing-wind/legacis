

//  This page is no longer used.
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { formatHumanDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

import { 
  countBlogs, 
  getAllCategories, 
  findBlogs, 
  getLatestBlog, 
  getRecentBlogs, 
  getFeaturedBlogs 
} from "@/lib/data/blogs";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from 'next';


export const metadata: Metadata = {
    title: "Blog",
    description: "Explore our latest insights, news, and articles on AI (Artificial Intelligence), financial markets, investment strategies, and more.",
};


const BLOGS_PER_PAGE = 9;

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams || {};

  const page = Number(params?.page) || 1;
  const category = typeof params?.category === "string" ? params.category : undefined;

  const skip = (page - 1) * BLOGS_PER_PAGE;
  
  // Get all required data separately
  const [
    paginatedBlogs,    // For "All Blogs" section with pagination and category filter
    latest,            // Latest blog (unaffected by category filter)
    recent,            // Recent blogs (unaffected by category filter)
    featured,          // Featured blogs (unaffected by category filter)
    totalCount,
    categories
  ] = await Promise.all([
    findBlogs({ skip, take: BLOGS_PER_PAGE, category }), // Paginated blogs for "All Blogs" section
    getLatestBlog(),                                     // Latest blog
    getRecentBlogs(4),                                   // Recent blogs
    getFeaturedBlogs(),                                  // Featured blogs
    countBlogs(category),                                // Total count for pagination
    getAllCategories()                                   // All categories
  ]);

  const totalPages = Math.ceil(totalCount / BLOGS_PER_PAGE);
  const selectedCategory = category;

  if (!latest && !paginatedBlogs.length) {
    return (
      <div className="w-full px-5 lg:px-10 xl:px-24 py-8">
        <h3 className="font-medium text-2xl mb-4">Categories</h3>
        <Tabs defaultValue={selectedCategory || "all"} className="mb-8">
          <TabsList className="py-4 h-12">
            <TabsTrigger value="all" asChild className="text-lg flex-shrink-0 p-5">
              <Link href="?">All</Link>
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} asChild className="text-lg flex-shrink-0 p-5">
                <Link href={`?category=${encodeURIComponent(cat)}`}>{cat}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="p-8 text-center text-muted-foreground">
          No blogs found.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-5 lg:px-10 xl:px-24 space-y-12 py-20">
      {/* Latest + Recent - Always show regardless of category filter */}
      {latest && (
        <div className="flex flex-col xl:flex-row gap-8 items-stretch">
          {/* Latest Blog */}
          <Card className="lg:max-w-7xl xl:min-h-[80vh] w-full flex-1 flex flex-col p-0 dark:bg-neutral-800 shadow">
            <Link href={`/blog/${latest.slug}`}>
              <CardContent className="flex flex-col gap-4 p-0">
                <div className="w-full aspect-video rounded-t-xl overflow-hidden relative">
                  <Image
                    src={latest.featuredImage || "/placeholder.png"}
                    alt={latest.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {latest.featured && <Badge variant="default">Featured</Badge>}
                    <Badge variant="secondary">{latest.category}</Badge>
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold">
                     {latest.title.length > 60 ? `${latest.title.slice(0, 60)}...` : latest.title}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                     {latest.excerpt && latest.excerpt.length > 120 ? `${latest.excerpt.slice(0, 120)}...` : latest.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-gray-500">
                    <Image
                      src={latest.author?.image || "/icons/favicon.ico"}
                      alt={latest.author?.name || "Legacis Author"}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{latest.author?.name || "Legacis Author"}</span>
                    <span>· {formatHumanDate(latest.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
          
          {/* Recent Blogs Table */}
          {recent.length > 0 && (
            <Card className="xl:max-w-2xl xl:min-h-[80vh] w-full flex-1 flex flex-col bg-card dark:bg-neutral-800 rounded-xl shadow p-4">
              <h3 className="font-medium text-2xl">Recent Blogs</h3>
              <Table className="w-full text-sm">
                <TableBody className="">
                  {recent.map((blog) => (
                    <TableRow key={blog.id} className="border-b last:border-b-0">
                      <TableCell className="py-2 ">
                        <Link
                          href={`/blog/${blog.slug}`}
                          className="font-medium flex flex-col lg:flex-row items-start gap-4"
                        >
                          <div className="relative aspect-video w-full lg:w-auto lg:h-36 flex-shrink-0 rounded-lg overflow-clip">
                            <Image
                              src={blog.featuredImage || "/placeholder.png"}
                              alt={blog.title}
                              fill
                              quality={30}
                              className="absolute mr-2 object-cover"
                              sizes="(100vw - 2rem) 100vw, 100vw"
                            />
                          </div>
                          <div className="text-wrap">
                            <h6 className="text-lg md:text-xl font-medium">
                              {blog.title.length > 60 ? `${blog.title.slice(0, 60)}...` : blog.title}
                            </h6>
                            <p className="mt-1 text-sm font-normal !text-neutral-500">
                              {blog.excerpt && blog.excerpt.length > 80 ? `${blog.excerpt.slice(0, 80)}...` : blog.excerpt}
                            </p>
                            <div className="flex items-center gap-2 text-gray-500">
                              <span className="text-sm text-muted-foreground">
                                {formatHumanDate(blog.createdAt)}
                              </span>
                              <Button
                                variant={"link"}
                                className="text-legacisPurple dark:text-legacisGreen"
                              >
                                Read more ...
                              </Button>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {/* Featured Blogs - Always show regardless of category filter */}
      {featured.length > 0 && (
        <section className="w-full mt-20 bg-legacisLightGreen dark:bg-neutral-800 rounded-2xl p-4">
          <h3 className="font-medium mb-3 text-2xl">Must Read</h3>
          <div className="overflow-x-auto pb-2  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((blog) => (
              <Card
                key={blog.id}
                className="w-full flex-shrink-0 border-0 p-0 shadow-none bg-transparent"
              >
                <Link href={`/blog/${blog.slug}`}>
                  <CardContent className="p-0 border-0 shadow-none">
                     <div className="relative aspect-video w-full mb-2 overflow-clip rounded-lg">
                       <Image
                         src={blog.featuredImage || "/placeholder.png"}
                         alt={blog.title}
                         fill
                         className="rounded-lg w-full h-32 object-cover mb-2"
                       />
                     </div>
                    <div className="text-wrap">
                      <div className="mb-1 h-6">
                        {blog.category.length > 0 && (
                          <Badge variant="secondary">{blog.category}</Badge>
                        )}
                      </div>
                      <h6 className="text-lg md:text-xl font-medium">
                        {blog.title.length > 120 ? `${blog.title.slice(0, 120)}...` : blog.title}
                      </h6>
                      <p className="mt-1 text-sm md:text-base !text-neutral-500">
                        {blog.excerpt && blog.excerpt.length > 120 ? `${blog.excerpt.slice(0, 120)}...` : blog.excerpt}
                      </p>
                      <div className="flex items-center gap-2 ">
                        <span className="text-sm md:text-base text-muted-foreground ">
                          {formatHumanDate(blog.createdAt)}
                        </span>
                        <Button variant={"link"} className="text-inherit">
                          Read more ...
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Categories and All Blogs - Affected by category filter */}
      <h3 id="allblogs" className="font-medium text-2xl mb-4">Categories</h3>
      <Tabs defaultValue={selectedCategory || "all"} className="mb-8">
        <TabsList className="py-4 h-12">
          <TabsTrigger value="all" asChild className="text-lg flex-shrink-0 p-5">
            <Link href="?#allblogs">All</Link>
          </TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} asChild className="text-lg flex-shrink-0 p-5">
              <Link href={`?category=${encodeURIComponent(cat)}#allblogs`}>{cat}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {paginatedBlogs.length > 0 ? (
        <section  className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-4">
          <div className='w-full mt-8'>
            <h3 className="mb-8 font-medium text-xl">
              {selectedCategory ? `${selectedCategory} Blogs` : 'All Blogs'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedBlogs.map(blog => (
                <Card key={blog.id} className="w-full bg-transparent flex-shrink-0 border-0 p-0 shadow-none">
                  <Link href={`/blog/${blog.slug}`}>
                    <CardContent className="p-0 border-0 shadow-none">
                      <div className='relative aspect-video w-full mb-2 overflow-clip rounded-lg'>
                        <Image
                          src={blog.featuredImage || "/placeholder.png"}
                          alt={blog.title}
                          fill
                          className="rounded-lg w-full h-32 object-cover mb-2"
                        />
                      </div>
                      <div className='text-wrap'>
                        <div className='mb-1 h-6'>
                          {blog.category.length > 0 && (
                            <Badge variant='secondary'>{blog.category}</Badge>
                          )}
                        </div>
                        <h6 className='text-lg md:text-xl font-medium'>
                          {blog.title.length > 120 ? `${blog.title.slice(0, 120)}...` : blog.title}
                        </h6>
                        <p className='mt-1 text-sm md:text-base !text-neutral-500'>
                          {blog.excerpt && blog.excerpt.length > 120 ? `${blog.excerpt.slice(0, 120)}...` : blog.excerpt}
                        </p>
                        <div className='flex items-center gap-4 mt-2'>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Image
                              src={blog.author?.image || "/icons/favicon.ico"}
                              alt={blog.author?.name || "Legacis Author"}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className='text-xs md:text-base'>{blog.author?.name || "Legacis Author"} .</span>
                          </div>
                          <span className="text-xs md:text-base text-muted-foreground ">{formatHumanDate(blog.createdAt)}</span>
                          <Button variant={'link'} className='text-inherit p-0 md:p-4'>Read more ...</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No blogs found for the selected category.
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`?page=${page - 1}#allblogs${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}#allblogs` : ""}`} />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={`?page=${pageNumber}#allblogs${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}#allblogs` : ""}`}
                    isActive={page === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={`?page=${page + 1}#allblogs${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}#allblogs` : ""}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Page;