/**
 * Configuração de filtros para identificar animes no TMDB
 * Replicada da lógica do frontend (src/services/tmdb.js)
 */

export const TMDB_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  
  // Filtros de anime (mesma lógica do frontend)
  ANIME_FILTERS: {
    KEYWORD_ID: 210024,      // Keyword "anime" no TMDB
    ANIMATION_GENRE_ID: 16,  // Gênero "Animation"
    ORIGIN_COUNTRY: 'JP',    // País de origem Japão
  },
  
  // Preferências de idioma
  LANGUAGE: 'pt-BR',
  FALLBACK_LANGUAGE: 'en-US',
} as const;

/**
 * Valida se uma série do TMDB é um anime
 * Baseado em: keyword anime OU (gênero animação E origem JP)
 */
export function isAnime(show: {
  keywords?: { results?: Array<{ id: number }> };
  genres?: Array<{ id: number }>;
  origin_country?: string[];
}): boolean {
  // Checa keyword "anime"
  const hasAnimeKeyword = show.keywords?.results?.some(
    (k) => k.id === TMDB_CONFIG.ANIME_FILTERS.KEYWORD_ID
  );
  
  if (hasAnimeKeyword) return true;

  // Checa gênero Animation E origem JP
  const hasAnimationGenre = show.genres?.some(
    (g) => g.id === TMDB_CONFIG.ANIME_FILTERS.ANIMATION_GENRE_ID
  );
  
  const isFromJapan = show.origin_country?.includes(
    TMDB_CONFIG.ANIME_FILTERS.ORIGIN_COUNTRY
  );

  return !!(hasAnimationGenre && isFromJapan);
}
