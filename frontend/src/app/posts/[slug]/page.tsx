import { getPostBySlug, getAllPostSlugs } from "@/lib/wordpress";
import { notFound } from "next/navigation";
import "@/app/entry-content.css";

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title.replace(/<[^>]*>/g, "")} | My Blog`,
    description: post.excerpt?.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <a href="/" className="hover:text-gray-900 transition-colors">
          ホーム
        </a>
        <span>›</span>
        <span
          className="text-gray-900 truncate"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
      </nav>

      {post.categories && post.categories.nodes.length > 0 && (
        <div className="flex gap-2 mb-4">
          {post.categories.nodes.map((cat) => (
            <span
              key={cat.slug}
              className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-3 py-1"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      <h1
        className="text-4xl font-extrabold tracking-tight leading-tight mb-4"
        dangerouslySetInnerHTML={{ __html: post.title }}
      />

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
        <time>{formatDate(post.date)}</time>
        {post.author?.node.name && (
          <>
            <span>·</span>
            <span>{post.author.node.name}</span>
          </>
        )}
      </div>

      {post.featuredImage && (
        <div className="mb-10 rounded-2xl overflow-hidden aspect-video">
          <img
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || ""}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div
        className="entry-content"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />

      <div className="mt-16 pt-8 border-t border-gray-200">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          記事一覧に戻る
        </a>
      </div>
    </div>
  );
}
