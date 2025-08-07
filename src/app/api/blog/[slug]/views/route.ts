import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = await params;
  try {
    const blog = await db.blog.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });
    return NextResponse.json({ views: blog.views });
  } catch (error) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }
}