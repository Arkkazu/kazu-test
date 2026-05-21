import { fetchGraphQL } from "./graphql/client";
import {
  GET_POSTS,
  GET_POST_BY_SLUG,
  GET_ALL_POST_SLUGS,
} from "./graphql/queries/posts";
import {
  GET_PAGES,
  GET_PAGE_BY_SLUG,
  GET_ALL_PAGE_SLUGS,
} from "./graphql/queries/pages";
import {
  GET_NEWS,
  GET_NEWS_BY_SLUG,
  GET_ALL_NEWS_SLUGS,
  GET_ALL_NEWS_FOR_NAVIGATION,
} from "./graphql/queries/news";

// --- 型定義 ---

export type Post = {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  date: string;
  modified?: string;
  excerpt: string;
  content?: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails?: { width: number; height: number };
    };
  };
  author?: { node: { name: string; avatar: { url: string } } };
  categories?: { nodes: { name: string; slug: string }[] };
  tags?: { nodes: { name: string; slug: string }[] };
};

export type Page = {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  date: string;
  modified?: string;
  content?: string;
  about?: {
    about?: string;
  };
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails?: { width: number; height: number };
    };
  };
};

export type NewsItem = {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  date: string;
  modified?: string;
  excerpt?: string;
  content: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
};

type PostsResponse = {
  posts: {
    pageInfo: { hasNextPage: boolean; endCursor: string };
    nodes: Post[];
  };
};

type PostResponse = { postBy: Post | null };
type PostSlugsResponse = { posts: { nodes: { slug: string }[] } };
type PagesResponse = { pages: { nodes: Page[] } };
type PageResponse = { pageBy: Page | null };
type PageSlugsResponse = { pages: { nodes: { slug: string }[] } };
type NewsResponse = { allNews: { nodes: NewsItem[] } };
type NewsItemResponse = { newsBy: NewsItem | null };
type NewsSlugsResponse = { allNews: { nodes: { slug: string }[] } };
type NewsNavResponse = { allNews: { nodes: { slug: string; title: string; date: string }[] } };

export type AdjacentNews = {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

// --- 投稿 ---

export async function getPosts(first = 10, after?: string): Promise<Post[]> {
  const data = await fetchGraphQL<PostsResponse>(
    GET_POSTS,
    { first, after },
    { tags: ["wp-posts"] }
  );
  return data.posts.nodes;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const data = await fetchGraphQL<PostResponse>(
    GET_POST_BY_SLUG,
    { slug },
    { tags: ["wp-posts", `wp-post-${slug}`] }
  );
  return data.postBy;
}

export async function getAllPostSlugs(): Promise<string[]> {
  const data = await fetchGraphQL<PostSlugsResponse>(
    GET_ALL_POST_SLUGS,
    {},
    { revalidate: 3600 }
  );
  return data.posts.nodes.map((n) => n.slug);
}

// --- 固定ページ ---

export async function getPages(): Promise<Page[]> {
  const data = await fetchGraphQL<PagesResponse>(
    GET_PAGES,
    {},
    { tags: ["wp-pages"] }
  );
  return data.pages.nodes;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const data = await fetchGraphQL<PageResponse>(
    GET_PAGE_BY_SLUG,
    { slug },
    { tags: ["wp-pages", `wp-page-${slug}`] }
  );
  return data.pageBy;
}

export async function getAllPageSlugs(): Promise<string[]> {
  const data = await fetchGraphQL<PageSlugsResponse>(
    GET_ALL_PAGE_SLUGS,
    {},
    { revalidate: 3600 }
  );
  return data.pages.nodes.map((n) => n.slug);
}

// --- お知らせ ---

export async function getNews(first = 10): Promise<NewsItem[]> {
  const data = await fetchGraphQL<NewsResponse>(
    GET_NEWS,
    { first },
    { tags: ["wp-news"] }
  );
  return data.allNews.nodes;
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const data = await fetchGraphQL<NewsItemResponse>(
    GET_NEWS_BY_SLUG,
    { slug },
    { tags: ["wp-news", `wp-news-${slug}`] }
  );
  return data.newsBy;
}

export async function getAdjacentNews(currentSlug: string): Promise<AdjacentNews> {
  const data = await fetchGraphQL<NewsNavResponse>(
    GET_ALL_NEWS_FOR_NAVIGATION,
    {},
    { tags: ["wp-news"] }
  );
  // WPGraphQL はデフォルトで日付降順（新しい順）で返す
  // index が小さいほど新しい記事、大きいほど古い記事
  const nodes = data.allNews.nodes;
  const index = nodes.findIndex((n) => n.slug === currentSlug);
  return {
    prev: index < nodes.length - 1 ? nodes[index + 1] : null, // 古い記事（前の記事）
    next: index > 0 ? nodes[index - 1] : null,                 // 新しい記事（次の記事）
  };
}

export async function getAllNewsSlugs(): Promise<string[]> {
  const data = await fetchGraphQL<NewsSlugsResponse>(
    GET_ALL_NEWS_SLUGS,
    {},
    { revalidate: 3600 }
  );
  return data.allNews.nodes.map((n) => n.slug);
}
