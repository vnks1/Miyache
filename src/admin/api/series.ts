import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleApiResponse } from './client';
import type {
  ApiResponse,
  Series,
  SeriesStats,
  PaginatedResponse,
  AuditLog,
} from '../types/api.types';
import type { CreateSeriesInput, UpdateSeriesInput } from '../schemas/series.schemas';

// List series
export function useSeriesList(params?: {
  query?: string;
  visibility?: string;
  source?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['series', 'list', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Series>>>(
        '/api/series',
        { params }
      );
      return handleApiResponse(data);
    },
  });
}

// Get series by ID
export function useSeries(id: string) {
  return useQuery({
    queryKey: ['series', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Series>>(`/api/series/${id}`);
      return handleApiResponse(data);
    },
    enabled: !!id,
  });
}

// Get series stats
export function useSeriesStats() {
  return useQuery({
    queryKey: ['series', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SeriesStats>>('/api/series/stats');
      return handleApiResponse(data);
    },
  });
}

// Get audit logs
export function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: ['series', 'audit', limit],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AuditLog[]>>('/api/series/audit', {
        params: { limit },
      });
      return handleApiResponse(data);
    },
  });
}

// Create series
export function useCreateSeries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateSeriesInput) => {
      const { data } = await apiClient.post<ApiResponse<Series>>('/api/series', input);
      return handleApiResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}

// Update series
export function useUpdateSeries(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateSeriesInput) => {
      const { data } = await apiClient.patch<ApiResponse<Series>>(`/api/series/${id}`, input);
      return handleApiResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}

// Archive series
export function useArchiveSeries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<ApiResponse<Series>>(`/api/series/${id}/archive`);
      return handleApiResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}

// Unarchive series
export function useUnarchiveSeries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<ApiResponse<Series>>(`/api/series/${id}/unarchive`);
      return handleApiResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}

// Publish series
export function usePublishSeries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<ApiResponse<Series>>(`/api/series/${id}/publish`);
      return handleApiResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}

// Unpublish series
export function useUnpublishSeries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<ApiResponse<Series>>(`/api/series/${id}/unpublish`);
      return handleApiResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}

// Sync series
export function useSyncSeries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<ApiResponse<Series>>(`/api/series/${id}/sync`);
      return handleApiResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}

// Delete series
export function useDeleteSeries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
        `/api/series/${id}`
      );
      return handleApiResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}
