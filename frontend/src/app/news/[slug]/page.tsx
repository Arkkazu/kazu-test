import { getNewsBySlug, getAllNewsSlugs, getAdjacentNews } from "@/lib/wordpress";
import { notFound } from "next/navigation";
import "@/app/entry-content.css";

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
  const [item, adjacent] = await Promise.all([
    getNewsBySlug(slug),
    getAdjacentNews(slug),
  ]);
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
        <time dateTime={item.date}>{formatDate(item.date)}</time>
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

      {/* 前後ナビゲーション */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-3 items-center gap-4">

          {/* 次の記事（新しい）← 左 */}
          <div className="flex justify-start">
            {adjacent.next ? (
              <a
                href={`/news/${adjacent.next.slug}`}
                className="group flex items-start gap-2 text-sm hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0 group-hover:text-blue-600 text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>
                  <span className="block text-xs text-gray-400 mb-0.5">次の記事</span>
                  <span
                    className="font-medium text-gray-700 group-hover:text-blue-600 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: adjacent.next.title }}
                  />
                </span>
              </a>
            ) : (
              <span />
            )}
          </div>

          {/* 一覧に戻る */}
          <div className="flex justify-center">
            <a
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-full px-4 py-1.5 hover:border-gray-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              一覧
            </a>
          </div>

          {/* 前の記事（古い）→ 右 */}
          <div className="flex justify-end">
            {adjacent.prev ? (
              <a
                href={`/news/${adjacent.prev.slug}`}
                className="group flex items-start gap-2 text-sm hover:text-blue-600 transition-colors text-right"
              >
                <span>
                  <span className="block text-xs text-gray-400 mb-0.5">前の記事</span>
                  <span
                    className="font-medium text-gray-700 group-hover:text-blue-600 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: adjacent.prev.title }}
                  />
                </span>
                <svg className="w-4 h-4 mt-0.5 shrink-0 group-hover:text-blue-600 text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ) : (
              <span />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
