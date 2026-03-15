import { searchPosts } from "@/services/posts.service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({ results: [], total: 0, query: q });
  }

  const results = await searchPosts(q);

  return NextResponse.json({
    results,
    total: results.length,
    query: q,
  });
}
