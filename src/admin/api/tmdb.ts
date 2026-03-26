import { useQuery } from '@tanstack/react-query';
import { apiClient, handleApiResponse } from './client';
import type { ApiResponse, TmdbShow } from '../types/api.types';

// Search anime on TMDB
export function useTmdbSearch(query: string) {
  return useQuery({
    queryKey: ['tmdb', 'search', query],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<TmdbShow[]>>('/api/tmdb/search', {
        params: { query },
      });
      return handleApiResponse(data);
    },
    enabled: query.length > 0,
  });
}

// Get anime by TMDB ID
export function useTmdbAnime(tmdbId: number) {
  return useQuery({
    queryKey: ['tmdb', 'anime', tmdbId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<TmdbShow>>(
        `/api/tmdb/anime/${tmdbId}`
      );
      return handleApiResponse(data);
    },
    enabled: !!tmdbId,
  });
}
