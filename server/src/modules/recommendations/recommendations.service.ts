import { usersService } from '../users/users.service.js';
import { tmdbService } from '../tmdb/tmdb.service.js';
import { rankAnimeRecommendations, AnimeData } from '../../utils/recommendation.js';

export class RecommendationsService {
  async getRecommendations(nick: string) {
    const saved = await usersService.getSavedAnime(nick);
    
    const savedAnimes: AnimeData[] = saved
      .filter((a: any) => a.liked && a.watched)
      .map((a: any) => ({
        tmdbId: a.tmdbId,
        title: a.title,
        overview: a.overview,
        posterPath: a.posterPath,
        backdropPath: a.backdropPath,
        voteAverage: a.voteAverage,
        popularity: a.popularity,
        genreIds: a.genreIds || []
      }));

    if (savedAnimes.length === 0) {
      const trending = await tmdbService.fetchTrendingAnime();
      const mappedTrending = trending.slice(0, 12).map(t => tmdbService.mapTmdbAnime(t));
      return {
        recommendations: mappedTrending,
        becauseYouLiked: []
      };
    }

    const allGenreIds = new Set<number>();
    savedAnimes.forEach(a => a.genreIds.forEach(g => allGenreIds.add(g)));
    
    const candidatesRaw = await tmdbService.fetchCandidatesFromTMDB(Array.from(allGenreIds));
    const candidates: AnimeData[] = candidatesRaw.map(c => tmdbService.mapTmdbAnime(c));

    const ranked = rankAnimeRecommendations(savedAnimes, candidates);

    const topRecommendations = ranked.slice(0, 12);
    const becauseYouLiked = topRecommendations.filter(r => r.reasons.length > 0);

    return {
      recommendations: topRecommendations,
      becauseYouLiked
    };
  }
}

export const recommendationsService = new RecommendationsService();
