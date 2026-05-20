import type { Post, NewsItem } from "@/lib/wordpress";

type Item = Pick<Post | NewsItem, "id" | "title" | "slug" | "date" | "featuredImage"> & {
  excerpt?: string;
  content?: string;
  categories?: { nodes: { name: string; slug: string }[] };
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toPlainText(html: string, maxLength = 120): string {
  return html.replace(/<[^>]*>/g, "").slice(0, maxLength);
}

export default function PostCard({ post, basePath = "/posts" }: { post: Item; basePath?: string }) {
  const href = `${basePath}/${post.slug}`;
  const plainSummary = !post.excerpt && post.content ? toPlainText(post.content) : null;

  return (
    <article className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <a href={href} className="block aspect-video bg-gray-100 overflow-hidden">
        {post.featuredImage ? (
          <img
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
      </a>
      <div className="p-6">
        {post.categories?.nodes[0] && (
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-3 py-1 mb-3">
            {post.categories.nodes[0].name}
          </span>
        )}
        <h2 className="text-lg font-bold leading-snug mb-2 line-clamp-2">
          <a
            href={href}
            className="hover:text-blue-600 transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />
        </h2>
        <time className="text-xs text-gray-400">{formatDate(post.date)}</time>
        {post.excerpt ? (
          <div
            className="mt-2 text-sm text-gray-600 line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
        ) : plainSummary ? (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {plainSummary}
          </p>
        ) : null}
        <a
          href={href}
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          続きを読む
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  );
}
