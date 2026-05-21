import { getPageBySlug } from "@/lib/wordpress";
import { notFound } from "next/navigation";
import "@/app/entry-content.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About | My Blog",
  description: "このサイトについて",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | My Blog",
    description: "このサイトについて",
    url: "/about",
    type: "website",
  },
};

export default async function AboutPage() {
  const page = await getPageBySlug("about");
  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <a href="/" className="hover:text-gray-900 transition-colors">ホーム</a>
        <span>›</span>
        <span className="text-gray-900">About</span>
      </nav>

      <h1
        className="text-4xl font-extrabold tracking-tight leading-tight mb-12"
        dangerouslySetInnerHTML={{ __html: page.title }}
      />

      {page.featuredImage && (
        <div className="mb-10 rounded-2xl overflow-hidden aspect-video">
          <img
            src={page.featuredImage.node.sourceUrl}
            alt={page.featuredImage.node.altText || ""}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {page.about?.about && (
        <p className="text-lg text-gray-700 leading-relaxed mb-10">
          {page.about.about}
        </p>
      )}

      <div
        className="entry-content"
        dangerouslySetInnerHTML={{ __html: page.content || "" }}
      />
    </div>
  );
}
