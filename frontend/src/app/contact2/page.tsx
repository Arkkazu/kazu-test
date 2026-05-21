import type { Metadata } from "next";
import Contact2Form from "./Contact2Form";

export const metadata: Metadata = {
  title: "お問い合わせ (2) | My Blog",
  description: "お問い合わせはこちらからお気軽にどうぞ。",
  alternates: { canonical: "/contact" },
  openGraph: {
    siteName: "My Blog",
    locale: "ja_JP",
    title: "お問い合わせ | My Blog",
    description: "お問い合わせはこちらからお気軽にどうぞ。",
    url: "/contact",
    type: "website",
  },
};

export default function Contact2Page() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <a href="/" className="hover:text-gray-900 transition-colors">
          ホーム
        </a>
        <span>›</span>
        <span className="text-gray-900">お問い合わせ</span>
      </nav>

      <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
        お問い合わせ
      </h1>
      <p className="text-gray-600 mb-10">
        ご質問・ご要望などお気軽にお問い合わせください。内容を確認の上、担当者よりご連絡いたします。
      </p>

      <Contact2Form />
    </div>
  );
}
