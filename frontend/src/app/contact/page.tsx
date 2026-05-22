import ContactForm from "./ContactForm";
import { buildMetadata } from "@/lib/metadata";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata = buildMetadata(
  "お問い合わせ | My Blog",
  "お問い合わせはこちらからお気軽にどうぞ。",
  "/contact"
);

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Breadcrumb items={[
        { name: "ホーム", href: "/" },
        { name: "お問い合わせ" },
      ]} />

      <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
        お問い合わせ
      </h1>
      <p className="text-gray-600 mb-10">
        ご質問・ご要望などお気軽にお問い合わせください。内容を確認の上、担当者よりご連絡いたします。
      </p>

      <ContactForm />
    </div>
  );
}
