export const GET_PAGES = `
  query GetPages {
    pages(first: 100) {
      nodes {
        id
        databaseId
        title
        slug
        date
        modified
      }
    }
  }
`;

export const GET_PAGE_BY_SLUG = `
  query GetPageBySlug($slug: String!) {
    pageBy(uri: $slug) {
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
          mediaDetails { width height }
        }
      }
    }
  }
`;

export const GET_ALL_PAGE_SLUGS = `
  query GetAllPageSlugs {
    pages(first: 100) {
      nodes { slug }
    }
  }
`;
