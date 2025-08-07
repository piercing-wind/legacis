"use client";
import { useEffect, useRef } from "react";

export function IncrementBlogView({ slug }: { slug: string }) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!hasIncremented.current) {
      fetch(`/api/blog/${slug}/views`, { method: "POST" });
      hasIncremented.current = true;
    }
  }, [slug]);

  return null;
}