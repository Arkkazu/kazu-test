import type { Metadata } from "next";

const SITE_NAME = "My Blog";
const LOCALE = "ja_JP";

export function buildMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: SITE_NAME,
      locale: LOCALE,
      title,
      description,
      url: path,
      type: "website",
    },
  };
}

export function buildArticleMetadata(
  plainTitle: string,
  suffix: string,
  description: string | undefined,
  path: string,
  options?: { image?: string; publishedTime?: string }
): Metadata {
  const title = `${plainTitle} | ${suffix}`;
  const ogImage = options?.image;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: SITE_NAME,
      locale: LOCALE,
      title: plainTitle,
      description,
      url: path,
      type: "article",
      publishedTime: options?.publishedTime,
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: plainTitle,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}
