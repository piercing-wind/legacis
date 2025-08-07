'use client'
import React, { useRef } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Blog } from '@/prisma/generated/client'
import Link from 'next/link'
import Image from 'next/image'

const CARD_WIDTH = 420 // px, adjust as needed

export type HomeBlog = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  featured: boolean
  views: number
  category: string[]
  author: {
    id: string
    name: string | null
    image: string | null
  } | null
  createdAt: Date
  updatedAt: Date
}

const HomeBlogs = ({ blogs }: { blogs: HomeBlog[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -CARD_WIDTH, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' })
    }
  }
return (
  <div className="w-full my-8 min-h-96">
    <div className="flex flex-col md:flex-row items-center gap-4 mb-4 h-full">
      {/* Left Arrow (desktop only) */}
      <div className="hidden md:flex flex-col justify-center">
        <Button
          variant="outline"
          className="rounded-full border-0 hover:bg-neutral-800 hover:text-white p-2 h-10 w-10"
          onClick={handlePrev}
        >
          <ChevronLeft size={32} />
        </Button>
      </div>
      {/* Scroll area */}
      <div className="flex-1 overflow-x-auto sm:px-12 w-full">
        <div
          ref={scrollRef}
          className="flex gap-6 scroll-smooth overflow-x-auto scrollbar-hide py-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="min-w-[320px] max-w-sm bg-white dark:bg-neutral-900 rounded-lg shadow p-4 flex flex-col justify-between scroll-snap-align-start"
            >
              <div className="relative aspect-video w-full mb-2 overflow-clip rounded-lg">
                <Image
                  src={blog.featuredImage || "/placeholder.png"}
                  alt={blog.title}
                  fill
                  className="rounded-lg w-full h-32 object-cover mb-2"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-8 line-clamp-3">
                {blog.excerpt}
              </p>
              <Link href={`/blog/${blog.slug}`} className="uppercase text-sm text-legacisPurple dark:text-legacisGreen font-medium">
                Read More ...
              </Link>
            </div>
          ))}
        </div>
      </div>
      {/* Right Arrow (desktop only) */}
      <div className="hidden md:flex flex-col justify-center">
        <Button
          variant="outline"
          className="rounded-full border-0 hover:bg-neutral-800 hover:text-white p-2 h-10 w-10"
          onClick={handleNext}
        >
          <ChevronRight size={32} />
        </Button>
      </div>
    </div>
    {/* Arrow buttons on mobile (below cards) */}
    <div className="flex md:hidden flex-row gap-4 justify-center mt-4">
      <Button
        variant="outline"
        className="rounded-full border-0 hover:bg-neutral-800 hover:text-white p-2 h-10 w-10"
        onClick={handlePrev}
      >
        <ChevronLeft size={32} />
      </Button>
      <Button
        variant="outline"
        className="rounded-full border-0 hover:bg-neutral-800 hover:text-white p-2 h-10 w-10"
        onClick={handleNext}
      >
        <ChevronRight size={32} />
      </Button>
    </div>
  </div>
)
}

export default HomeBlogs