import { getNewsBySlug, getAllNewsSlugs } from "@/lib/wordpress";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  try {
    const slugs = await getAllNewsSlugs();
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
  const item = await getNewsBySlug(slug);
  if (!item) return {};
  return {
    title: `${item.title.replace(/<[^>]*>/g, "")} | お知らせ`,
    description: item.excerpt?.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <a href="/" className="hover:text-gray-900 transition-colors">ホーム</a>
        <span>›</span>
        <a href="/news" className="hover:text-gray-900 transition-colors">お知らせ</a>
        <span>›</span>
        <span className="text-gray-900 truncate" dangerouslySetInnerHTML={{ __html: item.title }} />
      </nav>

      <p className="text-sm font-semibold text-blue-600 mb-2">お知らせ</p>

      <h1
        className="text-4xl font-extrabold tracking-tight leading-tight mb-4"
        dangerouslySetInnerHTML={{ __html: item.title }}
      />

      <div className="text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
        <time>{formatDate(item.date)}</time>
      </div>

      {item.featuredImage && (
        <div className="mb-10 rounded-2xl overflow-hidden aspect-video">
          <img
            src={item.featuredImage.node.sourceUrl}
            alt={item.featuredImage.node.altText || ""}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div
        className="entry-content"
        dangerouslySetInnerHTML={{ __html: item.content || "" }}
      />

      <div className="mt-16 pt-8 border-t border-gray-200">
        <a
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          お知らせ一覧に戻る
        </a>
      </div>
    </div>
  );
}
