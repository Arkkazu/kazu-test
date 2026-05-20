const WP_GRAPHQL_URL_SERVER = `${process.env.WP_API_BASE_SERVER}/graphql`;
const WP_GRAPHQL_URL_PUBLIC = `${process.env.WP_API_BASE_PUBLIC}/graphql`;

type FetchOptions = {
  tags?: string[];
  revalidate?: number | false;
};

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: FetchOptions = {}
): Promise<T> {
  const isServer = typeof window === "undefined";
  const url = isServer ? WP_GRAPHQL_URL_SERVER : WP_GRAPHQL_URL_PUBLIC;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    ...(process.env.NODE_ENV === "development"
      ? { cache: "no-store" as const }
      : { next: { tags: options.tags, revalidate: options.revalidate ?? 3600 } }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}
