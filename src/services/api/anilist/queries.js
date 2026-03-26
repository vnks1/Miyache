const MEDIA_BASE_FIELDS = `
  id
  title { romaji english native }
  description(asHtml: false)
  coverImage { large extraLarge }
  bannerImage
  averageScore
  genres
  startDate { year month day }
  status
  format
  episodes
`;

export const GET_POPULAR_MEDIA = `
  query GetPopularMedia($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
      }
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ${MEDIA_BASE_FIELDS}
      }
    }
  }
`;

export const SEARCH_MEDIA = `
  query SearchMedia($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
      }
      media(search: $search, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ${MEDIA_BASE_FIELDS}
      }
    }
  }
`;

export const GET_MEDIA_DETAILS = `
  query GetMediaDetails($id: Int) {
    Media(id: $id, type: ANIME) {
      ${MEDIA_BASE_FIELDS}
    }
  }
`;
