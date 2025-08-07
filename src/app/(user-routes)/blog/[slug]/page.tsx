import { QuillHtmlViewer } from "@/components/richTextViewer";
import { findBlogBySlug, findBlogs, getFeaturedBlogs, getRecentBlogs } from "@/lib/data/blogs";
import { notFound } from "next/navigation";
import Image from "next/image";
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import { formatHumanDate } from "@/lib/utils";
import { IncrementBlogView } from "@/components/IncrementBlogView";
import { auth } from "@/auth";
import { Metadata } from "next";

function extractHeadings(delta: any) {
  if (!delta || !Array.isArray(delta.ops)) return [];
  const headings: { text: string; level: number; id: string }[] = [];
  
  try {
    // Convert delta to HTML first
    const converter = new QuillDeltaToHtmlConverter(delta.ops, {});
    let html = converter.convert();
    
    // Extract headings from HTML
    const headingRegex = /<(h[1-6])>(.*?)<\/\1>/g;
    let match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1].charAt(1)); // Extract number from h1, h2, etc.
      const content = match[2];
      // Remove HTML tags from content for clean text
      const text = content.replace(/<[^>]+>/g, '').trim();
      const id = slugify(text);
      
      if (text) {
        headings.push({ text, level, id });
      }
    }
  } catch (error) {
    // Fallback: try to extract from delta ops directly
    for (const op of delta.ops) {
      if (op.insert && typeof op.insert === "string" && op.attributes && op.attributes.header) {
        const text = op.insert.trim();
        const level = op.attributes.header;
        const id = slugify(text);
        headings.push({ text, level, id });
      }
    }
  }
  
  return headings;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateStaticParams() {
  const posts = await findBlogs({take: 30});

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }):Promise<Metadata> {
  const { slug } = params;
  const blog = await findBlogBySlug(slug);
   if (!blog) {
      return {
         title: "Blog Not Found",
         description: "The blog you are looking for does not exist.",
      };
   }
   return {
      title: blog.title,
      description: blog.excerpt || "Read our latest insights and articles on financial services and investment solutions.",
      openGraph: {
         title: blog.title,
         description: blog.excerpt || "Read our latest insights and articles on financial services and investment solutions.",
         url: `https://legaciscapital.com/blog/${blog.slug}`,
         type: "article",
         images: [
            {
               url: blog.featuredImage || "/placeholder.png",
               alt: blog.title,
            },
         ],
      },
      authors: blog.author
        ? [{ name: blog.author.name ?? "Legacis Author", url: "https://x.com/raghavwadhwa" }]
        : [{ name: "Legacis Capital", url: "https://legaciscapital.com" }],
      twitter: {
         card: "summary_large_image",
         title: blog.title,
         description: blog.excerpt || "Read our latest insights and articles on financial services and investment solutions.",
         images: [blog.featuredImage || "/placeholder.png"],
      },
   };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [blog, recent, featured] = await Promise.all([
    findBlogBySlug(slug),
    getRecentBlogs(5),
    getFeaturedBlogs()
   ]);

  if (!blog) {
    return notFound();
  }

  let delta: any = blog.content;
  if (typeof delta === "string") {
    try {
      delta = JSON.parse(delta);
    } catch {
      delta = { ops: [{ insert: blog.content }] };
    }
  }

  const headings = extractHeadings(delta);
  
  return (
   <main className="w-full mx-auto px-5 lg:px-10 xl:px-24 py-16">
      <IncrementBlogView slug={blog.slug} />

      <div className="flex gap-8 ">
         {/* TOC */}
         <nav className="hidden lg:block max-w-80 max-h-[80vh] overflow-y-auto flex-shrink-0 sticky top-24 self-start">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">On this page</h2>
            {headings.length > 0 ? (
               <ul className="space-y-2">
                  {headings.map((h, idx) => (
                  <li key={h.id + idx} style={{ marginLeft: `${(h.level - 1) * 16}px` }}>
                     <Link
                        href={`#${h.id}`}
                        className="text-sm hover:underline block"
                     >
                        {h.text}
                     </Link>
                  </li>
                  ))}
               </ul>
            ) : (
               <p className="text-sm text-gray-500 dark:text-gray-400">No headings found</p>
            )}
            </div>
               
         </nav>
         
         <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:shrink-0">
            {/* Title */}
            <h1 className="text-4xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{blog.title}</h1>
            
            {/* Featured Image */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 shadow">
               <Image
                  src={blog.featuredImage || "/placeholder.png"}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
               />
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
               <Image
                  src={blog.author?.image || "/icons/favicon.ico"}
                  alt={blog.author?.name || "Author"}
                  width={40}
                  height={40}
                  className="rounded-full border"
               />
               <span className="font-medium text-gray-800 dark:text-gray-200">{blog.author?.name || "Legacis Author"}</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
               {new Date(blog.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </span>
            {blog.category.length > 0 && (
               <Badge variant={'secondary'}> 
                  {Array.isArray(blog.category) ? blog.category.join(", ") : blog.category}
               </Badge>
            )}
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
            <p className="text-base text-gray-700 dark:text-gray-300 mb-8">{blog.excerpt}</p>
            )}

            {/* Content */}
            <section className="prose prose-lg dark:prose-invert max-w-none text-base !text-neutral-600 tracking-wide">
            <QuillHtmlViewer delta={delta} />
            </section>
         </article>
         <nav className="hidden lg:block max-w-80 flex-shrink-0 sticky top-24 self-start">
            {recent.length > 0 && (
               <Card className="w-full flex-1 flex flex-col bg-card dark:bg-neutral-800 rounded-xl border-0 shadow-none p-4">
               <h3 className="font-medium text-lg">Recent Blogs</h3>
               <Table className="w-full text-sm">
                  <TableBody className="">
                     {recent.map((blog) => (
                     <TableRow key={blog.id} className="border-b last:border-b-0">
                        <TableCell className="py-2 ">
                           <Link
                           href={`/blog/${blog.slug}`}
                           className="font-medium flex items-start gap-4"
                           >
                           <div className="relative aspect-video w-full lg:w-auto lg:h-16 flex-shrink-0 rounded-sm overflow-clip">
                              <Image
                                 src={blog.featuredImage || "/placeholder.png"}
                                 alt={blog.title}
                                 fill
                                 quality={30}
                                 className="absolute mr-2 object-cover"
                                 sizes="(100vw - 2rem) 100vw, 100vw"
                              />
                           </div>
                              <h6 className="text-xs font-medium text-wrap">
                              {blog.title.length > 60 ? `${blog.title.slice(0, 60)}...` : blog.title}
                              </h6>
         
                           </Link>
                        </TableCell>
                     </TableRow>
                     ))}
                  </TableBody>
               </Table>
               </Card>
            )}
         </nav>
      </div>
      {featured.length > 0 && (
        <section className="w-full mt-20 bg-pink-100 dark:bg-neutral-800 rounded-2xl p-4 md:p-8">
          <h3 className="font-medium mb-3 text-2xl">Featured Blogs</h3>
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
   </main>
  );
}