export const SEARCH_CONTENT = `
  query SearchContent($search: String!) {
    posts(first: 20, where: { search: $search }) {
      nodes {
        title
        slug
        date
        excerpt
      }
    }
    allNews(first: 20, where: { search: $search }) {
      nodes {
        title
        slug
        date
        excerpt
      }
    }
  }
`;
