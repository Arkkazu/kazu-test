export const GET_NEWS = `
  query GetAllNews($first: Int = 10) {
    allNews(first: $first) {
      nodes {
        id
        databaseId
        title
        slug
        date
        content
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

export const GET_NEWS_BY_SLUG = `
  query GetNewsBySlug($slug: String!) {
    newsBy(slug: $slug) {
      id
      databaseId
      title
      slug
      date
      modified
      content
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`;

export const GET_ALL_NEWS_SLUGS = `
  query GetAllNewsSlugs {
    allNews(first: 100) {
      nodes { slug }
    }
  }
`;

export const GET_ALL_NEWS_FOR_NAVIGATION = `
  query GetAllNewsForNavigation {
    allNews(first: 100) {
      nodes {
        slug
        title
        date
      }
    }
  }
`;
