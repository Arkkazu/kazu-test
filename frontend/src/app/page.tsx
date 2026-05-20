import { getPosts, getNews } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [posts, newsItems] = await Promise.all([getPosts(9), getNews(6)]);

  return (
    <>
      <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6">Welcome to My Blog</h1>
          <p className="text-xl text-gray-500 leading-relaxed">最新の記事・ニュース・情報をお届けします。</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-10">お知らせ（カスタム投稿）</h2>
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

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-10">通常投稿</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">記事がありません。WordPress に記事を追加してください。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
