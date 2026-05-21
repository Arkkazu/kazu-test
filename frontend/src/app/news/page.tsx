import { getNews } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "お知らせ | My Blog",
  description: "お知らせの一覧です。",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "お知らせ | My Blog",
    description: "お知らせの一覧です。",
    url: "/news",
    type: "website",
  },
};

const PER_PAGE = 9;

export default async function NewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const allNews = await getNews(1000);
  const total = allNews.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(Math.max(1, parseInt(pageParam ?? "1", 10)), totalPages);
  const newsItems = allNews.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <a href="/" className="hover:text-gray-900 transition-colors">ホーム</a>
            <span>›</span>
            <span className="text-gray-900">お知らせ</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">お知らせ</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        {newsItems.length === 0 ? (
          <p className="text-gray-500">お知らせがありません。</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((item) => (
                <PostCard key={item.id} post={item} basePath="/news" />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-12 flex justify-center items-center gap-2" aria-label="ページネーション">
                {currentPage > 1 ? (
                  <Link
                    href={`/news?page=${currentPage - 1}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    前へ
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-md cursor-not-allowed">
                    前へ
                  </span>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/news?page=${p}`}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      p === currentPage
                        ? "bg-gray-900 text-white pointer-events-none"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </Link>
                ))}

                {currentPage < totalPages ? (
                  <Link
                    href={`/news?page=${currentPage + 1}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    次へ
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-md cursor-not-allowed">
                    次へ
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}
