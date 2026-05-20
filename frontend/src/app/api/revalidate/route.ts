import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { postType, slug } = body as { postType?: string; slug?: string };

  if (postType === "post") {
    revalidateTag("wp-posts");
    if (slug) revalidateTag(`wp-post-${slug}`);
  } else if (postType === "page") {
    revalidateTag("wp-pages");
    if (slug) revalidateTag(`wp-page-${slug}`);
  } else {
    revalidateTag("wp-posts");
    revalidateTag("wp-pages");
  }

  return NextResponse.json({ revalidated: true, postType, slug });
}
