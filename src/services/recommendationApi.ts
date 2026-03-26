import axios from 'axios';
import { getPopularMedia, searchMedia } from './api/media.service';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export interface AnimeData {
  anilistId?: number;
  id?: number;
  title: string;
  overview?: string | null;
  synopsis?: string | null;
  posterPath?: string | null;
  posterUrl?: string | null;
  backdropPath?: string | null;
  bannerUrl?: string | null;
  voteAverage?: number | null;
  score?: number | null;
  popularity?: number | null;
  genreIds?: number[];
  genres?: string[];
  liked?: boolean;
  watched?: boolean;
  source?: 'anilist';
}

export interface RecommendationItem extends AnimeData {
  score: number;
  reasons: string[];
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
  becauseYouLiked: RecommendationItem[];
}

function normalizeScore(value: number | null | undefined): number {
  if (typeof value !== 'number') return 0;
  return Number(value.toFixed(1));
}

function mapAniListMediaToRecommendation(media: any, reason: string): RecommendationItem {
  return {
    anilistId: media.id,
    id: media.id,
    title: media.title,
    synopsis: media.synopsis || null,
    posterUrl: media.posterUrl || null,
    bannerUrl: media.bannerUrl || null,
    score: normalizeScore(media.score),
    voteAverage: normalizeScore(media.score),
    genres: Array.isArray(media.genres) ? media.genres : [],
    liked: true,
    watched: false,
    source: 'anilist',
    reasons: [reason]
  };
}

function dedupeByAniListId(items: RecommendationItem[]): RecommendationItem[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    const id = item.anilistId || item.id;
    if (!id) return false;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

async function getSavedAniListAnime(nick: string): Promise<AnimeData[]> {
  const response = await api.get(`/users/${encodeURIComponent(nick)}/anilist`);
  return response?.data?.data || [];
}

async function getAniListRecommendations(nick: string): Promise<RecommendationResponse | null> {
  const saved = await getSavedAniListAnime(nick);
  if (!saved || saved.length === 0) {
    return null;
  }

  const likedBase = saved.filter((item) => item.liked || item.watched);
  if (likedBase.length === 0) {
    return null;
  }

  const excludedIds = new Set<number>(
    likedBase
      .map((item) => item.anilistId || item.id)
      .filter((id): id is number => typeof id === 'number')
  );

  const genreCount = new Map<string, number>();
  likedBase.forEach((item) => {
    (item.genres || []).forEach((genre) => {
      if (!genre) return;
      genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
    });
  });

  const topGenres = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre)
    .slice(0, 3);

  const recommendationBuckets = await Promise.all(
    topGenres.map(async (genre) => {
      const result = await searchMedia(genre, 1, 12);
      return (result?.items || [])
        .filter((item) => !excludedIds.has(item.id))
        .map((item) => mapAniListMediaToRecommendation(item, `Porque você curte ${genre}`));
    })
  );

  let recommendations = dedupeByAniListId(recommendationBuckets.flat()).slice(0, 12);

  if (recommendations.length < 12) {
    const popular = await getPopularMedia(1, 25);
    const fallback = (popular?.items || [])
      .filter((item) => !excludedIds.has(item.id))
      .map((item) => mapAniListMediaToRecommendation(item, 'Popular agora'));

    recommendations = dedupeByAniListId([...recommendations, ...fallback]).slice(0, 12);
  }

  const becauseYouLiked: RecommendationItem[] = [];

  for (const base of likedBase.slice(0, 6)) {
    const baseGenre = (base.genres || [])[0];
    if (!baseGenre) continue;

    const result = await searchMedia(baseGenre, 1, 6);
    const candidate = (result?.items || []).find((item) => !excludedIds.has(item.id));
    if (!candidate) continue;

    becauseYouLiked.push(
      mapAniListMediaToRecommendation(candidate, `Semelhante a ${base.title}`)
    );
  }

  const uniqueBecauseYouLiked = dedupeByAniListId(becauseYouLiked).slice(0, 10);

  if (recommendations.length === 0 && uniqueBecauseYouLiked.length === 0) {
    return null;
  }

  return {
    recommendations,
    becauseYouLiked: uniqueBecauseYouLiked
  };
}

export const getRecommendations = async (nick: string): Promise<RecommendationResponse> => {
  const fromAniList = await getAniListRecommendations(nick);
  if (fromAniList) return fromAniList;

  const popular = await getPopularMedia(1, 20);
  const recommendations = (popular?.items || [])
    .slice(0, 12)
    .map((item) => mapAniListMediaToRecommendation(item, 'Popular agora'));

  return {
    recommendations,
    becauseYouLiked: []
  };
};

export const saveUserAnime = async (nick: string, payload: AnimeData) => {
  const response = await api.post(`/users/${encodeURIComponent(nick)}/anime`, payload);
  return response.data;
};

export const getSavedAnime = async (nick: string) => {
  const response = await api.get(`/users/${encodeURIComponent(nick)}/anime`);
  return response.data.data;
};
