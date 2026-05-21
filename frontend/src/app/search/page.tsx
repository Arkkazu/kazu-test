import { searchContent } from "@/lib/wordpress";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `「${q}」の検索結果 | My Blog` : "検索 | My Blog",
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchContent(query) : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <a href="/" className="hover:text-gray-900 transition-colors">ホーム</a>
        <span>›</span>
        <span className="text-gray-900">検索</span>
      </nav>

      <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-8">
        検索
      </h1>

      <form action="/search" className="mb-10">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="キーワードを入力"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            検索
          </button>
        </div>
      </form>

      {query && (
        <p className="text-sm text-gray-500 mb-6">
          「<span className="font-medium text-gray-900">{query}</span>」の検索結果：{results.length} 件
        </p>
      )}

      {results.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {results.map((item) => (
            <li key={`${item.type}-${item.slug}`} className="py-6">
              <a
                href={`/${item.type === "news" ? "news" : "posts"}/${item.slug}`}
                className="group block"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.type === "news"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.type === "news" ? "お知らせ" : "ブログ"}
                  </span>
                  <time className="text-xs text-gray-400">{formatDate(item.date)}</time>
                </div>
                <h2
                  className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1"
                  dangerouslySetInnerHTML={{ __html: item.title }}
                />
                {item.excerpt && (
                  <p
                    className="text-sm text-gray-500 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: item.excerpt.replace(/<[^>]*>/g, "").slice(0, 120),
                    }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>
      ) : query ? (
        <p className="text-gray-500 text-sm">該当する記事が見つかりませんでした。</p>
      ) : null}
    </div>
  );
}
