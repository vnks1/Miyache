import { env } from '../../config/env.js';
import { TMDB_CONFIG, isAnime } from '../../config/tmdb.js';

interface TmdbShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  origin_country: string[];
  genres?: Array<{ id: number; name: string }>;
  keywords?: { results?: Array<{ id: number; name: string }> };
  status?: string;
}

export class TmdbService {
  private baseUrl = TMDB_CONFIG.BASE_URL;
  private apiKey = env.TMDB_API_KEY;

  /**
   * Busca séries no TMDB por query
   */
  async searchShows(query: string): Promise<TmdbShow[]> {
    const url = `${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(
      query
    )}&language=${TMDB_CONFIG.LANGUAGE}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro ao buscar no TMDB');
    }

    const data = await response.json() as any;
    return data.results || [];
  }

  /**
   * Detalhes completos de uma série por TMDB ID
   */
  async getShowDetails(tmdbId: number): Promise<TmdbShow> {
    const url = `${this.baseUrl}/tv/${tmdbId}?api_key=${this.apiKey}&language=${TMDB_CONFIG.LANGUAGE}&append_to_response=keywords`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Série não encontrada no TMDB');
    }

    return await response.json() as TmdbShow;
  }

  /**
   * Busca animes no TMDB
   * Filtra usando mesma lógica do frontend
   */
  async searchAnime(query: string): Promise<TmdbShow[]> {
    const shows = await this.searchShows(query);

    // Buscar detalhes completos para validar anime (keywords)
    const detailsPromises = shows.map((show) =>
      this.getShowDetails(show.id).catch(() => null)
    );

    const details = await Promise.all(detailsPromises);

    // Filtrar apenas animes
    return details.filter((show): show is TmdbShow => show !== null && isAnime(show));
  }

  /**
   * Busca anime por TMDB ID e valida se é anime
   */
  async getAnimeById(tmdbId: number): Promise<TmdbShow> {
    const show = await this.getShowDetails(tmdbId);

    if (!isAnime(show)) {
      throw new Error('Série não é um anime');
    }

    return show;
  }

  /**
   * Formata dados do TMDB para o formato do banco
   */
  formatForDatabase(tmdbShow: TmdbShow) {
    return {
      tmdbId: tmdbShow.id,
      title: tmdbShow.name,
      originalTitle: tmdbShow.original_name,
      overview: tmdbShow.overview || null,
      posterPath: tmdbShow.poster_path,
      backdropPath: tmdbShow.backdrop_path,
      genresJson: tmdbShow.genres ? JSON.stringify(tmdbShow.genres) : null,
      rating: tmdbShow.vote_average || null,
      releaseDate: tmdbShow.first_air_date || null,
      status: tmdbShow.status || null,
    };
  }

  /**
   * Fetch candidates using discover TV, filtering for animation (genre 16) and Japanese origin
   */
  async fetchCandidatesFromTMDB(genreIds: number[]): Promise<any[]> {
    if (genreIds.length === 0) return this.fetchTrendingAnime();

    // Use up to 3 genres to maintain variety but keep it focused
    const selectedGenres = genreIds.slice(0, 3).join('|');
    // Genre 16 = Animation. 10759 = Action & Adventure, etc.
    const url = `${this.baseUrl}/discover/tv?api_key=${this.apiKey}&language=${TMDB_CONFIG.LANGUAGE}&with_genres=16,${selectedGenres}&with_original_language=ja&sort_by=popularity.desc&page=1`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json() as any;
    return data.results || [];
  }

  /**
   * Fetch trending anime-like content
   */
  async fetchTrendingAnime(): Promise<any[]> {
    const url = `${this.baseUrl}/discover/tv?api_key=${this.apiKey}&language=${TMDB_CONFIG.LANGUAGE}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=1`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json() as any;
    return data.results || [];
  }

  /**
   * Map from TMDB format to the AnimeData format required by our engine
   */
  mapTmdbAnime(item: any) {
    return {
      tmdbId: item.id,
      title: item.name || item.title,
      overview: item.overview,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      voteAverage: item.vote_average,
      popularity: item.popularity,
      genreIds: item.genre_ids || [],
    };
  }
}

export const tmdbService = new TmdbService();
