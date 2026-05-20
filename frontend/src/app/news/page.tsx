import { getNews } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "お知らせ | My Blog",
  description: "お知らせの一覧です。",
};

export default async function NewsListPage() {
  const newsItems = await getNews(100);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <PostCard key={item.id} post={item} basePath="/news" />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
